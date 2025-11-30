// API слой для профиля пользователя
import { supabase } from '../supabase';
import {
  UserProfile,
  UpdateProfileDTO,
  StorageStats
} from '../../types/api.types';

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
            storage_used: 0
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data as UserProfile;
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw new Error('Failed to create profile');
    }
  },

  // Получить профиль пользователя
  async getProfile(userId: string): Promise<UserProfile> {
    try {
      let { data, error } = await supabase
        .from('users_profile')
        .select('id, full_name, avatar_url, storage_used, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') { // Profile not found
        try {
          // Attempt to create the profile
          await this.createProfile(userId);
          // After creation, try to fetch again
          ({ data, error } = await supabase
            .from('users_profile')
            .select('id, full_name, avatar_url, storage_used, created_at, updated_at')
            .eq('id', userId)
            .single());

          if (error) throw error; // If re-fetch still fails, throw error
          if (!data) throw new Error('Profile creation and re-fetch failed'); // Should not happen
        } catch (creationError: any) {
          if (creationError.code === '23505') { // Duplicate key error, means profile was created by another process
            // Try fetching again in case it was a race condition
            ({ data, error } = await supabase
              .from('users_profile')
              .select('id, full_name, avatar_url, storage_used, created_at, updated_at')
              .eq('id', userId)
              .single());
            if (error) throw error;
            if (!data) throw new Error('Race condition profile fetch failed');
          } else {
            console.error('Failed to create profile after not found:', creationError);
            throw new Error('Failed to get or create profile');
          }
        }
      } else if (error) {
        console.error('Supabase get profile error:', error);
        throw error;
      }

      if (!data) { // This should ideally be covered by the PGRST116 check above, but as a safeguard
        throw new Error('Profile data is unexpectedly empty');
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw new Error('Failed to get profile');
    }
  },

  // Обновить профиль пользователя
  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<UserProfile> {
    try {
      const { data: updatedData, error } = await supabase
        .from('users_profile')
        .upsert([{
          ...data,
          id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      return updatedData as UserProfile;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error('Failed to update profile');
    }
  },

  // Загрузить аватар
  async uploadAvatar(userId: string, file: File): Promise<string> {
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
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Получаем публичный URL файла
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      // Обновляем URL аватара в профиле (профиль будет создан если не существует)
      await this.updateProfile(userId, { avatar_url: publicUrl });

      return publicUrl;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to upload avatar');
    }
  },

  // Получить статистику по использованию хранилища
  async getStorageStats(userId: string): Promise<StorageStats> {
    try {
      let { data, error } = await supabase
        .from('users_profile')
        .select('storage_used')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') { // Profile not found
        try {
          // Attempt to create the profile
          await this.createProfile(userId);
          // After creation, try to fetch again
          ({ data, error } = await supabase
            .from('users_profile')
            .select('storage_used')
            .eq('id', userId)
            .single());

          if (error) throw error; // If re-fetch still fails, throw error
          if (!data) throw new Error('Profile creation and re-fetch for storage stats failed'); // Should not happen
        } catch (creationError: any) {
          if (creationError.code === '23505') { // Duplicate key error, means profile was created by another process
            // Try fetching again in case it was a race condition
            ({ data, error } = await supabase
              .from('users_profile')
              .select('storage_used')
              .eq('id', userId)
              .single());
            if (error) throw error;
            if (!data) throw new Error('Race condition storage stats fetch failed');
          } else {
            console.error('Failed to create profile after not found for storage stats:', creationError);
            throw new Error('Failed to get or create profile for storage stats');
          }
        }
      } else if (error) {
        console.error('Supabase get storage stats error:', error);
        throw error;
      }

      if (!data) { // This should ideally be covered by the PGRST116 check above, but as a safeguard
        throw new Error('Storage stats data is unexpectedly empty');
      }

      const limit = 5 * 1024 * 1024 * 1024; // 5GB в байтах
      const percentage = (data.storage_used / limit) * 100;

      return {
        used: data.storage_used,
        limit,
        percentage
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      throw new Error('Failed to get storage stats');
    }
  }
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