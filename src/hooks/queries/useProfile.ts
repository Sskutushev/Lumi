// src/hooks/queries/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileAPI } from '../../lib/api/profile.api';
import { UserProfile, UpdateProfileDTO } from '../../types/api.types';

const PROFILE_QUERY_KEY = 'profile';

export const useProfile = (userId: string) => {
  return useQuery<UserProfile>({
    queryKey: [PROFILE_QUERY_KEY, userId],
    queryFn: () => profileAPI.getProfile(userId),
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateProfileDTO }) =>
      profileAPI.updateProfile(userId, data),
    onSuccess: (updatedProfile, variables) => {
      // Обновляем профиль в кэше
      queryClient.setQueryData([PROFILE_QUERY_KEY, variables.userId], updatedProfile);
      // Инвалидируем профиль для обновления
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, variables.userId] });
    },
  });
};

// Специальный мутационный хук для загрузки аватара с инвалидацией кэша
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      profileAPI.uploadAvatar(userId, file),
    onSuccess: (avatarUrl, variables) => {
      // Обновляем профиль в кэше с новым URL аватара
      const currentProfile = queryClient.getQueryData<UserProfile>([
        PROFILE_QUERY_KEY,
        variables.userId,
      ]);
      if (currentProfile) {
        const updatedProfile = { ...currentProfile, avatar_url: avatarUrl };
        queryClient.setQueryData([PROFILE_QUERY_KEY, variables.userId], updatedProfile);
      }
      // Инвалидируем кэш профиля для всех зависимостей
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, variables.userId] });
    },
  });
};

// Обновленный мутационный хук для обновления профиля с инвалидацией кэша
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateProfileDTO }) =>
      profileAPI.updateProfile(userId, data),
    onSuccess: (updatedProfile, variables) => {
      // Обновляем профиль в кэше
      queryClient.setQueryData([PROFILE_QUERY_KEY, variables.userId], updatedProfile);
      // Инвалидируем профиль для обновления
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, variables.userId] });
    },
  });
};
