// API layer for user profile
import { supabase } from '../supabase';
import { UserProfile, UpdateProfileDTO, StorageStats } from '../../types/api.types';
import { ErrorHandler } from '../errors/ErrorHandler';
import { Logger } from '../errors/logger';
import { MAX_AVATAR_SIZE_BYTES, MAX_STORAGE_LIMIT_BYTES } from '../constants';
import { abortControllerService } from './abortController';

export const profileAPI = {
  /**
   * Creates a new user profile.
   * @param userId - The ID of the user for whom to create a profile.
   * @returns A promise that resolves to the newly created user profile.
   */
  async createProfile(userId: string): Promise<UserProfile> {
    const controller = abortControllerService.create(`profile-create-${userId}`);
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
        .abortSignal(_controller.signal)
        .single();

      if (error) throw error;
      return data as UserProfile;
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        // For AbortError, we still want to throw it but skip logging since it's expected during cancellation
        throw error;
      } else {
        Logger.error('Failed to create profile:', error);
        throw ErrorHandler.handle(error);
      }
    } finally {
      abortControllerService.cleanup(`profile-create-${userId}`);
    }
  },

  /**
   * Fetches a user profile. If the profile does not exist, it is created first.
   * @param userId - The ID of the user.
   * @returns A promise that resolves to the user profile.
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const _controller = abortControllerService.create(`profile-get-${userId}`);
    try {
      // Upsert does not support abortSignal, so we perform it without cancellation.
      // Perform upsert without awaiting to prevent blocking
      // Handle upsert in a way compatible with Supabase SDK
      try {
        await supabase.from('users_profile').upsert(
          [
            {
              id: userId,
              full_name: '',
              // Don't include avatar_url to avoid overwriting existing avatar - only set defaults
              storage_used: 0,
            },
          ],
          {
            onConflict: 'id',
          }
        );
      } catch (err) {
        // Log the error but don't throw it, as upsert is just for ensuring the record exists
        Logger.warn('Profile upsert failed, continuing with select query:', err);
      }

      const { data, error } = await supabase
        .from('users_profile')
        .select('id, full_name, avatar_url, storage_used, created_at, updated_at')
        .eq('id', userId)
        .abortSignal(_controller.signal)
        .single();

      if (error) throw error;
      return data as UserProfile;
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        // For AbortError, we still want to throw it but skip logging since it's expected during cancellation
        throw error;
      } else {
        Logger.error('Failed to get or create profile:', error);
        throw ErrorHandler.handle(error);
      }
    } finally {
      abortControllerService.cleanup(`profile-get-${userId}`);
    }
  },

  /**
   * Updates an existing user profile.
   * @param userId - The ID of the user to update.
   * @param data - An object with the profile fields to update.
   * @returns A promise that resolves to the updated user profile.
   */
  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<UserProfile> {
    const _controller = abortControllerService.create(`profile-update-${userId}`);
    try {
      const { data: updatedData, error } = await supabase
        .from('users_profile')
        .update(data)
        .eq('id', userId)
        .select()
        .abortSignal(_controller.signal)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found, try to insert
          const { data: newData, error: newError } = await supabase
            .from('users_profile')
            .insert([{ ...data, id: userId }])
            .select()
            .abortSignal(_controller.signal)
            .single();

          if (newError) throw ErrorHandler.handle(newError);
          return newData as UserProfile;
        } else {
          throw ErrorHandler.handle(error);
        }
      }

      return updatedData as UserProfile;
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        // For AbortError, we still want to throw it but skip logging since it's expected during cancellation
        throw error;
      } else {
        Logger.error('Failed to update profile:', error);
        throw ErrorHandler.handle(error);
      }
    } finally {
      abortControllerService.cleanup(`profile-update-${userId}`);
    }
  },

  /**
   * Uploads a new avatar for the user and updates the profile.
   * @param userId - The ID of the user.
   * @param file - The avatar file to upload.
   * @returns A promise that resolves to the updated user profile.
   */
  async uploadAvatar(userId: string, file: File): Promise<UserProfile> {
    const _controller = abortControllerService.create(`profile-uploadAvatar-${userId}`);
    try {
      if (file.size > MAX_AVATAR_SIZE_BYTES) {
        throw new Error(`File size exceeds ${MAX_AVATAR_SIZE_BYTES / 1024 / 1024}MB limit`);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const bucketName = 'avatars';

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(fileName);

      const updatedProfile = await this.updateProfile(userId, { avatar_url: publicUrl });

      return updatedProfile;
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        // For AbortError, we still want to throw it but skip logging since it's expected during cancellation
        throw error;
      } else {
        Logger.error('Failed to upload avatar:', error);
        throw ErrorHandler.handle(
          error instanceof Error ? error.message : 'Failed to upload avatar'
        );
      }
    } finally {
      abortControllerService.cleanup(`profile-uploadAvatar-${userId}`);
    }
  },

  /**
   * Fetches storage usage statistics for a user.
   * @param userId - The ID of the user.
   * @returns A promise that resolves to an object with storage statistics.
   */
  async getStorageStats(userId: string): Promise<StorageStats> {
    const controller = abortControllerService.create(`profile-getStats-${userId}`);
    try {
      const profile = await this.getProfile(userId);

      const percentage = (profile.storage_used / MAX_STORAGE_LIMIT_BYTES) * 100;

      return {
        used: profile.storage_used,
        limit: MAX_STORAGE_LIMIT_BYTES,
        percentage,
      };
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        // For AbortError, we still want to throw it but skip logging since it's expected during cancellation
        throw error;
      } else {
        Logger.error('Failed to get storage stats:', error);
        throw ErrorHandler.handle(error);
      }
    } finally {
      abortControllerService.cleanup(`profile-getStats-${userId}`);
    }
  },
};

/**
 * Formats a number of bytes into a human-readable string.
 * @param bytes - The number of bytes.
 * @param decimals - The number of decimal places to use.
 * @returns A formatted string (e.g., "1.23 MB").
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  if (i === 0) {
    return bytes + ' ' + sizes[i];
  }

  return (bytes / Math.pow(k, i)).toFixed(dm) + ' ' + sizes[i];
};
