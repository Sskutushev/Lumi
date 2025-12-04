// src/lib/api/__tests__/profile.api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../../supabase';
import { profileAPI } from '../profile.api';
import { MAX_AVATAR_SIZE_BYTES } from '../../constants';

vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn(),
      getPublicUrl: vi.fn(),
    },
  },
}));

describe('profileAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProfile should fetch a user profile', async () => {
    const mockProfile = { id: '1', full_name: 'Test User' };
    (supabase.from('users_profile').select().eq().single as vi.Mock).mockResolvedValue({
      data: mockProfile,
      error: null,
    });

    const profile = await profileAPI.getProfile('1');
    expect(profile).toEqual(mockProfile);
    expect(supabase.from).toHaveBeenCalledWith('users_profile');
    expect(supabase.select).toHaveBeenCalledWith(
      'id, full_name, avatar_url, storage_used, created_at, updated_at'
    );
    expect(supabase.eq).toHaveBeenCalledWith('id', '1');
  });

  it('updateProfile should update a user profile', async () => {
    const mockProfile = { id: '1', full_name: 'Updated User' };
    (supabase.from('users_profile').update().eq().select().single as vi.Mock).mockResolvedValue({
      data: mockProfile,
      error: null,
    });

    const updatedProfile = await profileAPI.updateProfile('1', { full_name: 'Updated User' });
    expect(updatedProfile).toEqual(mockProfile);
    expect(supabase.from).toHaveBeenCalledWith('users_profile');
    expect(supabase.update).toHaveBeenCalledWith({ full_name: 'Updated User' });
    expect(supabase.eq).toHaveBeenCalledWith('id', '1');
  });

  it('uploadAvatar should throw an error if file is too large', async () => {
    const largeFile = new File([''], 'large.png', { type: 'image/png' });
    Object.defineProperty(largeFile, 'size', { value: MAX_AVATAR_SIZE_BYTES + 1 });

    await expect(profileAPI.uploadAvatar('1', largeFile)).rejects.toThrow();
  });

  it('uploadAvatar should upload a file and update profile', async () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const publicUrl = 'http://example.com/avatar.png';
    const updatedProfile = { id: '1', avatar_url: publicUrl };

    (supabase.storage.from('avatars').upload as vi.Mock).mockResolvedValue({ error: null });
    (supabase.storage.from('avatars').getPublicUrl as vi.Mock).mockReturnValue({
      data: { publicUrl },
    });
    (supabase.from('users_profile').update().eq().select().single as vi.Mock).mockResolvedValue({
      data: updatedProfile,
      error: null,
    });

    const result = await profileAPI.uploadAvatar('1', file);
    expect(result).toEqual(updatedProfile);
    expect(supabase.storage.from).toHaveBeenCalledWith('avatars');
    expect(supabase.storage.from('avatars').upload).toHaveBeenCalled();
    expect(profileAPI.updateProfile).toHaveBeenCalledWith('1', { avatar_url: publicUrl });
  });
});
