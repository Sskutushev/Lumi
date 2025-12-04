// src/hooks/queries/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileAPI } from '../../lib/api/profile.api';
import { UserProfile, UpdateProfileDTO } from '../../types/api.types';

const PROFILE_QUERY_KEY = 'profile';

/**
 * Custom hook to fetch a user's profile.
 * @param userId - The ID of the user to fetch.
 * @returns A TanStack Query object for the user's profile.
 */
export const useProfile = (userId: string) => {
  return useQuery<UserProfile>({
    queryKey: [PROFILE_QUERY_KEY, userId],
    queryFn: () => profileAPI.getProfile(userId),
    enabled: !!userId,
    // Don't retry on abort errors
    retry: (failureCount, error) => {
      // Don't retry if it's an AbortError
      return (error as any).name !== 'AbortError';
    },
  });
};

/**
 * Custom hook to update a user's profile.
 * @returns A TanStack Mutation object for updating the profile.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateProfileDTO }) =>
      profileAPI.updateProfile(userId, data),
    onSuccess: (updatedProfile, variables) => {
      // Update the profile in the cache
      queryClient.setQueryData([PROFILE_QUERY_KEY, variables.userId], updatedProfile);
      // Invalidate the profile to refetch
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, variables.userId] });
    },
  });
};

/**
 * Custom hook to upload a user's avatar.
 * @returns A TanStack Mutation object for uploading the avatar.
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      profileAPI.uploadAvatar(userId, file),
    onSuccess: (updatedProfile, variables) => {
      // Update the profile in the cache with the new avatar URL
      const currentProfile = queryClient.getQueryData<UserProfile>([
        PROFILE_QUERY_KEY,
        variables.userId,
      ]);
      if (currentProfile) {
        const updatedProfileWithNewAvatar = {
          ...currentProfile,
          avatar_url: updatedProfile.avatar_url,
        };
        queryClient.setQueryData(
          [PROFILE_QUERY_KEY, variables.userId],
          updatedProfileWithNewAvatar
        );
      }
      // Invalidate the profile cache for all dependencies
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, variables.userId] });
    },
  });
};
