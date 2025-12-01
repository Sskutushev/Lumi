// src/lib/realtime/realtimeService.ts
import { supabase } from '../supabase';
import { Task } from '../../types/api.types';

class RealtimeService {
  private static instance: RealtimeService;
  private subscriptions: Map<string, Function> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;

  private constructor() {
    // Инициализация BroadcastChannel для синхронизации между вкладками
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      this.broadcastChannel = new BroadcastChannel('lumi_realtime');
      this.broadcastChannel.onmessage = (event) => {
        this.handleBroadcastMessage(event.data);
      };
    }
  }

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  // Подписка на реалтайм обновления задач
  subscribeToTasks(
    userId: string,
    callback: (task: Task, eventType: 'INSERT' | 'UPDATE' | 'DELETE') => void
  ) {
    const channel = supabase
      .channel(`tasks-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Отправить обновление в другие вкладки
          if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({
              type: 'TASK_UPDATE',
              data: payload,
              source: 'supabase',
            });
          }

          // Вызвать локальный коллбэк
          const record = (payload.new || payload.old) as any;
          if (record?.id) {
            callback(record as Task, payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE');
          }
        }
      )
      .subscribe();

    // Сохраняем канал для возможного отписания
    this.subscriptions.set(`tasks-${userId}`, () => {
      supabase.removeChannel(channel);
    });

    return channel;
  }

  // Подписка на реалтайм обновления проектов
  subscribeToProjects(
    userId: string,
    callback: (projectId: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE') => void
  ) {
    const channel = supabase
      .channel(`projects-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Отправить обновление в другие вкладки
          if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({
              type: 'PROJECT_UPDATE',
              data: payload,
              source: 'supabase',
            });
          }
          const projectId = (payload.new as any)?.id || (payload.old as any)?.id;
          if (projectId) {
            callback(projectId, payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE');
          }
        }
      )
      .subscribe();

    // Сохраняем канал для возможного отписания
    this.subscriptions.set(`projects-${userId}`, () => {
      supabase.removeChannel(channel);
    });

    return channel;
  }

  // Отписка от обновлений
  unsubscribe(key: string) {
    const unsubscribeFn = this.subscriptions.get(key);
    if (unsubscribeFn) {
      unsubscribeFn();
      this.subscriptions.delete(key);
    }
  }

  // Отправка сообщения в канал для синхронизации между вкладками
  broadcastMessage(message: any) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        ...message,
        timestamp: Date.now(),
        source: 'local',
      });
    }
  }

  // Обработка сообщений из BroadcastChannel
  private handleBroadcastMessage(data: any) {
    if (data.source === 'local') {
      // Это сообщение пришло из другой вкладки, не пересылать его обратно
      return;
    }

    // Обработка реалтайм обновлений
    switch (data.type) {
      case 'TASK_UPDATE':
        // Обновление задачи пришло из другого источника
        console.log('Task update from other tab or user:', data.data);
        break;
      case 'PROJECT_UPDATE':
        // Обновление проекта пришло из другого источника
        console.log('Project update from other tab or user:', data.data);
        break;
      default:
        console.log('Received unknown message type:', data);
    }
  }

  // Присоединение к presence-каналу для отслеживания онлайн-статуса
  joinPresenceChannel(channelName: string, userId: string, userData: any) {
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Как только подписка установлена, отслеживаем пользователя
        await channel.track({
          user_id: userId,
          ...userData,
          online_at: new Date().toISOString(),
        });
      }
    });

    return channel;
  }

  // Получение списка пользователей в канале
  getPresenceUsers(channelName: string) {
    const channel = supabase.channel(channelName);
    const presenceState = channel.presenceState();
    return presenceState;
  }

  // Очистка всех подписок
  cleanup() {
    this.subscriptions.forEach((unsubscribeFn) => {
      unsubscribeFn();
    });
    this.subscriptions.clear();

    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
  }
}

export const realtimeService = RealtimeService.getInstance();
