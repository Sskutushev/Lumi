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
    // Initialize BroadcastChannel for cross-tab synchronization
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

  // Subscribe to real-time task updates
  subscribeToTasks(
    userId: string,
    callback: (task: Task, eventType: 'INSERT' | 'UPDATE' | 'DELETE') => void
  ) {
    const channelKey = `tasks-${userId}`;

    // Store the original callback for potential reconnection
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
          // Reset reconnect attempts on successful data reception
          this.resetReconnectAttempts(channelKey);

          // Send update to other tabs
          if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({
              type: 'TASK_UPDATE',
              data: payload,
              source: 'supabase',
            });
          }

          // Invoke local callback
          const record = (payload.new || payload.old) as any;
          if (record?.id) {
            callback(record as Task, payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE');
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error(`Realtime subscription error for channel ${channelKey}:`, err);
          this.reconnect(channelKey);
        }
      });

    // Store the channel for potential unsubscription
    this.channels.set(channelKey, channel);
    this.subscriptions.set(channelKey, () => {
      supabase.removeChannel(channel);
    });

    return channel;
  }

  // Subscribe to real-time project updates
  subscribeToProjects(
    userId: string,
    callback: (projectId: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE') => void
  ) {
    const channelKey = `projects-${userId}`;

    // Store the original callback for potential reconnection
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
          // Reset reconnect attempts on successful data reception
          this.resetReconnectAttempts(channelKey);

          // Send update to other tabs
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
      .subscribe((status, err) => {
        if (err) {
          console.error(`Realtime subscription error for channel ${channelKey}:`, err);
          this.reconnect(channelKey);
        }
      });

    // Store the channel for potential unsubscription
    this.channels.set(channelKey, channel);
    this.subscriptions.set(channelKey, () => {
      supabase.removeChannel(channel);
    });

    return channel;
  }

  // Unsubscribe from updates
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

  // Method to handle reconnection
  async reconnect(channelKey: string, maxAttempts = 3) {
    const attempts = this.reconnectAttempts.get(channelKey) || 0;

    if (attempts < maxAttempts) {
      // Increment attempt count
      this.reconnectAttempts.set(channelKey, attempts + 1);

      // Calculate delay with exponential backoff
      const delay = Math.pow(2, attempts) * 1000;

      console.log(
        `Attempting to reconnect to channel ${channelKey}, attempt ${attempts + 1}/${maxAttempts}, delay: ${delay}ms`
      );

      // Wait for the specified delay
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Remove the existing channel from Supabase
      const existingChannel = this.channels.get(channelKey);
      if (existingChannel) {
        supabase.removeChannel(existingChannel);
      }

      // Restore the subscription based on channel type
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
      // Reset attempts to allow future retries
      this.reconnectAttempts.delete(channelKey);
      // An event could be emitted here to notify the UI
    }
  }

  // Method to reset reconnection attempts
  resetReconnectAttempts(channelKey: string) {
    this.reconnectAttempts.delete(channelKey);
  }

  // Send a message to the broadcast channel for cross-tab sync
  broadcastMessage(message: any) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        ...message,
        timestamp: Date.now(),
        source: 'local',
      });
    }
  }

  // Handle messages from the BroadcastChannel
  private handleBroadcastMessage(data: any) {
    if (data.source === 'local') {
      // This message came from the current tab, don't process it again
      return;
    }

    // Process real-time updates from other tabs
    switch (data.type) {
      case 'TASK_UPDATE':
        // A task was updated in another source
        console.log('Task update from other tab or user:', data.data);
        break;
      case 'PROJECT_UPDATE':
        // A project was updated in another source
        console.log('Project update from other tab or user:', data.data);
        break;
      default:
        console.log('Received unknown message type:', data);
    }
  }

  // Join a presence channel to track online status
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
        // Once subscribed, track the user's presence
        await channel.track({
          user_id: userId,
          ...userData,
          online_at: new Date().toISOString(),
        });
      }
    });

    return channel;
  }

  // Get a list of users in a presence channel
  getPresenceUsers(channelName: string) {
    const channel = supabase.channel(channelName);
    const presenceState = channel.presenceState();
    return presenceState;
  }

  // Clean up all subscriptions
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
