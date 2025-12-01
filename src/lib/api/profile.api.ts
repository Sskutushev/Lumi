// API слой для профиля пользователя
import { supabase } from '../supabase';
import { UserProfile, UpdateProfileDTO, StorageStats } from '../../types/api.types';
import { ErrorHandler } from '../errors/ErrorHandler'; // Added import
import { Logger } from '../errors/logger'; // Added import

export const profileAPI = {
  // Создать профиль пользователя
  async createProfile(userId: string): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('users_profile')
        .insert([
          {
            id: userId,
            full_name: '',
            avatar_url: null,
            storage_used: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as UserProfile;
    } catch (error) {
      Logger.error('Failed to create profile:', error); // Modified
      throw ErrorHandler.handle(error); // Modified
    }
  },

  // Получить профиль пользователя с созданием при необходимости
  async getProfile(userId: string): Promise<UserProfile> {
    try {
      // Попытка вставить профиль. Если он уже существует, ничего не произойдет благодаря onConflict: 'id'.
      await supabase.from('users_profile').upsert(
        [
          {
            id: userId,
            full_name: '',
            avatar_url: null,
            storage_used: 0,
          },
        ],
        {
          onConflict: 'id',
        }
      );

      // Теперь получаем профиль, который либо был только что создан, либо уже существовал.
      const { data, error } = await supabase
        .from('users_profile')
        .select('id, full_name, avatar_url, storage_used, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as UserProfile;
    } catch (error) {
      Logger.error('Failed to get or create profile:', error); // Modified
      throw ErrorHandler.handle(error); // Modified
    }
  },

  // Обновить профиль пользователя
  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<UserProfile> {
    try {
      const { data: updatedData, error } = await supabase
        .from('users_profile')
        .update(data)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found
          // Профиль не существует, создаем его с обновленными данными
          const { data: newData, error: newError } = await supabase
            .from('users_profile')
            .insert([{ ...data, id: userId }])
            .select()
            .single();

          if (newError) throw ErrorHandler.handle(newError); // Modified
          return newData as UserProfile;
        } else {
          throw ErrorHandler.handle(error); // Modified
        }
      }

      return updatedData as UserProfile;
    } catch (error) {
      Logger.error('Failed to update profile:', error); // Modified
      throw ErrorHandler.handle(error); // Modified
    }
  },

  // Загрузить аватар
  async uploadAvatar(userId: string, file: File): Promise<UserProfile> {
    try {
      // Проверяем размер файла (макс. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
      }

      // Загружаем файл в Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const bucketName = 'avatars'; // Убедитесь, что бакет 'avatars' существует в Supabase Storage

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Получаем публичный URL файла
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(fileName);

      // Обновляем URL аватара в профиле (профиль будет создан если не существует)
      const updatedProfile = await this.updateProfile(userId, { avatar_url: publicUrl });

      return updatedProfile;
    } catch (error) {
      Logger.error('Failed to upload avatar:', error); // Modified
      throw ErrorHandler.handle(error instanceof Error ? error.message : 'Failed to upload avatar'); // Modified
    }
  },

  // Получить статистику по использованию хранилища
  async getStorageStats(userId: string): Promise<StorageStats> {
    try {
      // Используем тот же подход - получаем профиль (создаем если нужно) и возвращаем статистику
      const profile = await this.getProfile(userId);

      const limit = 5 * 1024 * 1024 * 1024; // 5GB в байтах
      const percentage = (profile.storage_used / limit) * 100;

      return {
        used: profile.storage_used,
        limit,
        percentage,
      };
    } catch (error) {
      Logger.error('Failed to get storage stats:', error); // Modified
      throw ErrorHandler.handle(error); // Modified
    }
  },
};

// Вспомогательная функция для форматирования байтов
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
