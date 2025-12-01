// src/components/auth/__tests__/AuthModal.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AuthModal from '../AuthModal';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

// --- Моки ---
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// ПРАВИЛЬНЫЙ СПОСОБ МОКАТЬ С ЗАВИСИМОСТЯМИ
vi.mock('../../../lib/supabase', () => {
  const authMock = {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  };
  return {
    supabase: {
      auth: authMock,
    },
  };
});

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Получаем доступ к моку auth для настройки в тестах
const mockedAuth = supabase.auth;

describe('AuthModal Component', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  const fillForm = (email = 'test@example.com', password = 'password123') => {
    const emailInput = screen.getByLabelText('common.email');
    const passwordInput = screen.getByLabelText('common.password');
    fireEvent.change(emailInput, { target: { value: email } });
    fireEvent.change(passwordInput, { target: { value: password } });
  };

  it('should render sign-in form by default', () => {
    render(<AuthModal onClose={onCloseMock} />);
    expect(screen.getByRole('heading', { name: 'common.signIn' })).toBeInTheDocument();
  });

  it('should toggle to sign-up form', () => {
    render(<AuthModal onClose={onCloseMock} />);
    fireEvent.click(screen.getByRole('button', { name: 'common.signUp' }));
    expect(screen.getByRole('heading', { name: 'common.signUp' })).toBeInTheDocument();
  });

  it('should call signInWithPassword and onClose on successful sign-in', async () => {
    vi.mocked(mockedAuth.signInWithPassword).mockResolvedValue({
      data: { session: {} } as any,
      error: null,
    });

    render(<AuthModal onClose={onCloseMock} />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'common.signIn' }));

    await waitFor(() => {
      expect(mockedAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should display an error message on failed sign-in', async () => {
    vi.mocked(mockedAuth.signInWithPassword).mockResolvedValue({
      data: {} as any,
      error: { message: 'Invalid login' },
    });

    render(<AuthModal onClose={onCloseMock} />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'common.signIn' }));

    expect(await screen.findByText('Invalid login')).toBeInTheDocument();
  });

  it('should call signUp and show success message', async () => {
    vi.mocked(mockedAuth.signUp).mockResolvedValue({ data: { session: null }, error: null });

    render(<AuthModal onClose={onCloseMock} />);
    fireEvent.click(screen.getByRole('button', { name: 'common.signUp' }));
    fillForm('new@user.com', 'password123');
    fireEvent.click(screen.getByRole('button', { name: 'common.signUp' }));

    expect(await screen.findByText('auth.signUpSuccess')).toBeInTheDocument();
  });

  it('should call signInWithOAuth for Google', () => {
    render(<AuthModal onClose={onCloseMock} />);
    fireEvent.click(screen.getByRole('button', { name: 'common.signInWithGoogle' }));
    expect(mockedAuth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: expect.any(String) },
    });
  });

  it('should call signInWithOAuth for GitHub', () => {
    render(<AuthModal onClose={onCloseMock} />);
    fireEvent.click(screen.getByRole('button', { name: 'common.signInWithGithub' }));
    expect(mockedAuth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'github',
      options: { redirectTo: expect.any(String) },
    });
  });

  it('should call resetPasswordForEmail and show success toast', async () => {
    vi.mocked(mockedAuth.resetPasswordForEmail).mockResolvedValue({ data: {}, error: null });

    render(<AuthModal onClose={onCloseMock} />);
    fillForm();
    fireEvent.click(screen.getByLabelText('common.resetPassword'));

    await waitFor(() => {
      expect(mockedAuth.resetPasswordForEmail).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('auth.passwordResetSuccess');
    });
  });
});
