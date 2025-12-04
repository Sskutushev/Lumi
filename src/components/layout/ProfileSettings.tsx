import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Camera, Activity, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { profileAPI, formatBytes } from '../../lib/api/profile.api';
import { tasksAPI } from '../../lib/api/tasks.api';
import { supabase } from '../../lib/supabase';
import { StorageStats, UserStats, UserProfile } from '../../types/api.types';
import { useQueryClient } from '@tanstack/react-query';
import { MAX_AVATAR_SIZE_BYTES, STORAGE_WARNING_THRESHOLD } from '../../lib/constants';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    avatar: null as string | null,
  });
  const [loading, setLoading] = useState(true);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Use a ref to track component mount status
  const isMountedRef = React.useRef(true);

  const loadProfileData = useCallback(async () => {
    if (!user || !isMountedRef.current) return;

    setLoading(true);
    try {
      // Execute API calls with individual error handling to prevent AbortError propagation
      const profilePromise = profileAPI.getProfile(user.id);
      const storageStatsPromise = profileAPI.getStorageStats(user.id);
      const statsPromise = tasksAPI.getStats(user.id);

      // Wait for all promises with specific AbortError handling
      const results = await Promise.all([
        profilePromise.catch((err) => {
          if ((err as any).name === 'AbortError') {
            // Return a special indicator for aborted requests
            return { __aborted: true, error: err };
          }
          throw err; // Re-throw other errors
        }),
        storageStatsPromise.catch((err) => {
          if ((err as any).name === 'AbortError') {
            return { __aborted: true, error: err };
          }
          throw err;
        }),
        statsPromise.catch((err) => {
          if ((err as any).name === 'AbortError') {
            return { __aborted: true, error: err };
          }
          throw err;
        }),
      ]);

      // Check if any of the operations were aborted
      const abortedResult = results.find((result: any) => result && result.__aborted);
      if (abortedResult) {
        return; // Exit early if any operation was aborted
      }

      const [profile, storageStatsData, stats] = results;

      if (
        isMountedRef.current &&
        profile &&
        typeof profile === 'object' &&
        !(profile as any).__aborted
      ) {
        setUserData((prev) => ({
          ...prev,
          name: (profile as UserProfile).full_name || '',
          email: user.email || '',
          currentPassword: '',
          newPassword: '',
          avatar: (profile as UserProfile).avatar_url || '',
        }));

        setStorageStats(storageStatsData as StorageStats);
        setUserStats(stats as UserStats);
      }
    } catch (error) {
      // Only show error if component is still mounted and it's not an AbortError
      if (isMountedRef.current) {
        // Check if this is an AbortError or a wrapped AbortError to avoid displaying it
        const isAbortError =
          (error as any).name === 'AbortError' || // Direct AbortError
          (error && typeof error === 'object' && (error as any).__aborted) || // Our custom aborted indicator
          (error &&
            typeof error === 'object' &&
            (error as any).message &&
            (error as any).message.includes('AbortError')); // Wrapped AbortError

        if (!isAbortError) {
          console.error('Error loading profile data:', error);
          toast.error(t('profile.loadError') || 'Failed to load profile data');
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user, t]);

  // Update the ref when component mounts/unmounts
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadProfileData().catch((error) => {
        // Catch any unhandled errors in loadProfileData, especially AbortError
        if ((error as any).name === 'AbortError') {
          // Silently handle AbortError - no need to log or show it
          return;
        }
        // For other errors, only log if component is still mounted
        if (isMountedRef.current) {
          console.error('Error in useEffect loadProfileData:', error);
        }
      });
    }
  }, [isOpen, loadProfileData, isMountedRef]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0] || !isMountedRef.current) return;

    const file = e.target.files[0];

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error(
        t('profile.avatarTooLarge') ||
          `Avatar must be less than ${MAX_AVATAR_SIZE_BYTES / (1024 * 1024)}MB`
      );
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.avatarInvalidType') || 'Please select an image file');
      return;
    }

    try {
      const updatedProfile = await profileAPI.uploadAvatar(user.id, file);

      if (isMountedRef.current) {
        setUserData((prev) => ({ ...prev, avatar: updatedProfile.avatar_url || null }));
        queryClient.setQueryData(['profile', user.id], updatedProfile);
        // Also invalidate all profile queries to ensure fresh data everywhere
        queryClient.invalidateQueries({ queryKey: ['profile'] });

        toast.success(t('profile.updateSuccess') || 'Avatar updated successfully!');
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        console.error('Error uploading avatar:', error);
        toast.error(
          t('profile.avatarUploadError') ||
            `Failed to upload avatar: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  };

  const updateProfile = async () => {
    if (!user || !isMountedRef.current) {
      if (isMountedRef.current) {
        toast.error('No user logged in');
      }
      return;
    }

    setIsUpdating(true);
    console.log('Updating profile for user:', user.id);
    try {
      const updateData: { full_name?: string; avatar_url?: string } = {};
      if (userData.name) {
        updateData.full_name = userData.name;
      }
      if (userData.avatar) {
        updateData.avatar_url = userData.avatar;
      }

      console.log('Data to send:', updateData);

      if (Object.keys(updateData).length === 0 && !userData.newPassword) {
        if (isMountedRef.current) {
          toast.info('No changes to save.');
        }
        if (isMountedRef.current) {
          onClose();
        }
        return;
      }

      if (Object.keys(updateData).length > 0) {
        const updatedProfile = await profileAPI.updateProfile(user.id, updateData);
        console.log('API response:', updatedProfile);

        if (isMountedRef.current && updatedProfile) {
          queryClient.setQueryData(['profile', user.id], updatedProfile);
          // Also invalidate all profile queries to ensure fresh data everywhere
          queryClient.invalidateQueries({ queryKey: ['profile'] });
        } else if (isMountedRef.current) {
          queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
          queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
      }

      if (userData.newPassword && userData.newPassword.length >= 6) {
        const { error } = await supabase.auth.updateUser({
          password: userData.newPassword,
        });

        if (error) throw error;
      } else if (
        userData.newPassword &&
        userData.newPassword.length > 0 &&
        userData.newPassword.length < 6
      ) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (isMountedRef.current) {
        toast.success(t('profile.updateSuccess') || 'Profile updated successfully!');
        onClose();
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        console.error('Error updating profile:', error);
        console.error('Error details:', error.message, error.code, error.status);
        toast.error(t('profile.updateError') || 'Error updating profile: ' + error.message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsUpdating(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl bg-bg-primary rounded-2xl shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-primary">{t('profile.settings')}</h2>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors disabled:opacity-50"
            aria-label={t('common.close') || 'Close'}
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Information */}
              <div className="space-y-6">
                <h3 className="font-semibold text-text-primary">{t('profile.personalInfo')}</h3>

                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    {userData.avatar ? (
                      <img
                        src={userData.avatar}
                        alt="Avatar"
                        loading="lazy"
                        className="w-24 h-24 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-accent-gradient-1 flex items-center justify-center text-white text-2xl font-bold">
                        {userData.name.charAt(0).toUpperCase() ||
                          user?.email?.charAt(0).toUpperCase() ||
                          'U'}
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-bg-elevated rounded-full p-2 border border-border cursor-pointer">
                      <Camera className="w-4 h-4 text-text-secondary" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>

                  <div className="w-full space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        {t('profile.name')}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-bg-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        {t('profile.email')}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userData.email}
                        disabled
                        className="w-full px-4 py-2 rounded-lg border border-border bg-bg-secondary/50 focus:outline-none text-text-tertiary cursor-not-allowed"
                      />
                      <p className="text-xs text-text-tertiary mt-1">
                        {t('profile.emailCannotBeChanged')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div className="space-y-6">
                <h3 className="font-semibold text-text-primary">{t('profile.account')}</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      {t('profile.currentPassword')}
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={userData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-bg-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary"
                      placeholder={t('profile.enterCurrentPassword')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      {t('profile.newPassword')}
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={userData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-bg-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary"
                      placeholder={t('profile.enterNewPassword')}
                    />
                  </div>
                </div>

                {/* Storage Usage */}
                <div className="pt-4">
                  <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    {t('profile.storage')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">{t('profile.storageUsed')}</span>
                      <span className="text-text-primary">
                        {storageStats
                          ? `${formatBytes(storageStats.used)} / ${formatBytes(storageStats.limit)}`
                          : 'Loading...'}
                      </span>
                    </div>
                    {storageStats && (
                      <div className="w-full bg-bg-tertiary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            storageStats.percentage > STORAGE_WARNING_THRESHOLD
                              ? 'bg-error'
                              : 'bg-accent-primary'
                          }`}
                          style={{ width: `${Math.min(100, storageStats.percentage)}%` }}
                        ></div>
                      </div>
                    )}
                    {storageStats && (
                      <p className="text-xs text-text-tertiary">
                        {t('profile.storageRemaining')}{' '}
                        {formatBytes(storageStats.limit - storageStats.used)}{' '}
                        {t('profile.remaining')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="pt-4">
                  <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {t('profile.activity')}
                  </h4>
                  <div className="space-y-2 text-sm text-text-secondary">
                    <div className="flex justify-between">
                      <span>{t('profile.lastActive')}</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    {userStats && (
                      <>
                        <div className="flex justify-between">
                          <span>{t('profile.tasksCompleted')}</span>
                          <span>{userStats.completed_tasks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('dashboard.overdue')}</span>
                          <span>{userStats.overdue_tasks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('profile.tasksThisWeek')}</span>
                          <span>{userStats.tasks_this_week}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 rounded-lg bg-bg-secondary text-text-primary hover:bg-bg-tertiary transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={updateProfile}
            disabled={isUpdating}
            className="px-4 py-2 rounded-lg bg-accent-gradient-1 text-white font-medium hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                {t('common.saving') || 'Saving...'}
              </>
            ) : (
              t('common.save')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
