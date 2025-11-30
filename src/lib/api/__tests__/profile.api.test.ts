import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profileAPI, formatBytes } from '../profile.api';
import { supabase } from '../../supabase';

// Мокаем supabase
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      update: vi.fn(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
  },
}));

describe('profileAPI', () => {
  const mockProfile = {
    id: 'user-123',
    full_name: 'Test User',
    avatar_url: null,
    storage_used: 1024,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get profile', async () => {
    const mockSelectReturn = {
      data: { ...mockProfile },
      error: null,
    };

    (supabase.from as any).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce(mockSelectReturn),
    });

    const result = await profileAPI.getProfile('user-123');

    expect(result).toEqual(mockProfile);
  });

  it('should update profile', async () => {
    const mockUpdateReturn = {
      data: { ...mockProfile, full_name: 'Updated Name' },
      error: null,
    };

    (supabase.from as any).mockReturnValueOnce({
      update: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce(mockUpdateReturn),
        }),
      }),
    });

    const result = await profileAPI.updateProfile('user-123', { full_name: 'Updated Name' });

    expect(result).toEqual({ ...mockProfile, full_name: 'Updated Name' });
  });

  it('should format bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1023)).toBe('1023 Bytes');
    expect(formatBytes(1024)).toBe('1.00 KB');
    expect(formatBytes(1024 * 1024)).toBe('1.00 MB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
  });

  it('should throw error if file is too large', async () => {
    const largeFile = new File(['a'.repeat(6 * 1024 * 1024)], 'large-file.png'); // 6MB file
    
    await expect(profileAPI.uploadAvatar('user-123', largeFile)).rejects.toThrow('File size exceeds 5MB limit');
  });
});