// src/lib/realtime/realtimeService.ts
import { supabase } from '../supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Task } from '../../types/api.types';

class RealtimeService {
  private static instance: RealtimeService;
  private subscriptions: Map<string, Function> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private reconnectAttempts: Map<string, number> = new Map();
  private channels: Map<string, any> = new Map(); // Store channel objects by key
  private callbacks: Map<string, any> = new Map(); // Store original callbacks by key

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
    const channelKey = `tasks-${userId}`;

    // Сохраняем оригинальный колбэк для возможного переподключения
    this.callbacks.set(channelKey, callback);

    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Сбрасываем попытки переподключения при успешном получении данных
          this.resetReconnectAttempts(channelKey);

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
    this.channels.set(channelKey, channel);
    this.subscriptions.set(channelKey, () => {
      supabase.removeChannel(channel);
    });

    return channel;
  }

  // Подписка на реалтайм обновления проектов
  subscribeToProjects(
    userId: string,
    callback: (projectId: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE') => void
  ) {
    const channelKey = `projects-${userId}`;

    // Сохраняем оригинальный колбэк для возможного переподключения
    this.callbacks.set(channelKey, callback);

    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Сбрасываем попытки переподключения при успешном получении данных
          this.resetReconnectAttempts(channelKey);

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
    this.channels.set(channelKey, channel);
    this.subscriptions.set(channelKey, () => {
      supabase.removeChannel(channel);
    });

    return channel;
  }

  // Отписка от обновлений
  unsubscribe(key: string | RealtimeChannel) {
    if (typeof key === 'string') {
      // If key is a string, look up in the subscriptions map
      const unsubscribeFn = this.subscriptions.get(key);
      if (unsubscribeFn) {
        unsubscribeFn();
        this.subscriptions.delete(key);
        this.reconnectAttempts.delete(key);
        this.channels.delete(key);
      }
    } else {
      // If key is a RealtimeChannel object, remove it directly from supabase
      supabase.removeChannel(key);
    }
  }

  // Метод для переподключения
  async reconnect(channelKey: string, maxAttempts = 3) {
    const attempts = this.reconnectAttempts.get(channelKey) || 0;

    if (attempts < maxAttempts) {
      // Увеличиваем количество попыток
      this.reconnectAttempts.set(channelKey, attempts + 1);

      // Вычисляем задержку с экспоненциальным откладыванием
      const delay = Math.pow(2, attempts) * 1000;

      console.log(
        `Attempting to reconnect to channel ${channelKey}, attempt ${attempts + 1}/${maxAttempts}, delay: ${delay}ms`
      );

      // Ждем заданное время перед повторной попыткой
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Удаляем текущий канал из Supabase
      const existingChannel = this.channels.get(channelKey);
      if (existingChannel) {
        supabase.removeChannel(existingChannel);
      }

      // Восстанавливаем подписку в зависимости от типа канала
      if (channelKey.startsWith('tasks-')) {
        const userId = channelKey.replace('tasks-', '');
        const reconnectCallback = this.callbacks.get(channelKey);
        if (reconnectCallback) {
          // Re-establish the subscription with the same callback
          const newChannel = this.subscribeToTasks(userId, reconnectCallback);
          this.channels.set(channelKey, newChannel);
        }
      } else if (channelKey.startsWith('projects-')) {
        const userId = channelKey.replace('projects-', '');
        const reconnectCallback = this.callbacks.get(channelKey);
        if (reconnectCallback) {
          // Re-establish the subscription with the same callback
          const newChannel = this.subscribeToProjects(userId, reconnectCallback);
          this.channels.set(channelKey, newChannel);
        }
      }
    } else {
      console.log(`Max reconnection attempts reached for channel ${channelKey}`);
      // Сброс попыток, чтобы дать шанс в будущем
      this.reconnectAttempts.delete(channelKey);
      // Можно выбросить событие об ошибке подключения
    }
  }

  // Метод для сброса попыток переподключения
  resetReconnectAttempts(channelKey: string) {
    this.reconnectAttempts.delete(channelKey);
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
