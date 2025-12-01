import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Github, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

// Simple Google logo component
const GoogleLogoComponent = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal = ({ onClose }: AuthModalProps) => {
  const { t } = useTranslation();
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let response;
      if (isSignIn) {
        // Sign in with email and password
        response = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } else {
        // Sign up with email and password
        response = await supabase.auth.signUp({
          email,
          password,
        });
      }

      if (response.error) throw response.error;

      if (!isSignIn && response.data.session === null) {
        // User needs to confirm email
        setIsSuccess(true);
        setSuccessMessage(
          t('auth.signUpSuccess') || '📧 Письмо отправлено! Проверьте почту для подтверждения.'
        );
      } else {
        // Close modal after successful auth
        onClose();
      }
    } catch (error: any) {
      console.error('Authentication error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        error,
      });

      // Более информативное сообщение об ошибке
      let errorMessage = error.message || 'Authentication failed';

      if (error.code === '23505') {
        // Duplicate key error
        errorMessage = 'User with this email already exists';
      } else if (
        error.message?.includes('database') ||
        error.message?.includes('saving new user')
      ) {
        // Пользователь может продолжать использование, даже если профиль не был создан сразу
        if (error.message.includes('saving new user')) {
          errorMessage =
            'Registration was successful, but there was an issue with profile creation. Please try logging in again shortly.';
        } else {
          errorMessage = 'Database error occurred. Please try again later.';
        }
      } else if (error.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (error.code === 'unexpected_failure') {
        // В случае ошибки создания профиля, пользователь все равно может войти после подтверждения
        errorMessage =
          'Registration successful! Please check your email to confirm your account before logging in.';
      }

      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });

      if (error) throw error;

      toast.success(t('auth.passwordResetSuccess') || 'Password reset link sent to your email');
    } catch (error: any) {
      console.error('Error resetting password:', error.message);
      toast.error(error.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error(`Error signing in with ${provider}:`, error.message);
      setErrorMessage(error.message || `Failed to sign in with ${provider}`);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md bg-bg-primary rounded-2xl shadow-2xl border border-border overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-text-primary mb-2">
              {t('common.success') || 'Success'}
            </h3>

            <p className="text-text-secondary mb-6">{successMessage}</p>

            <button
              onClick={() => {
                setIsSuccess(false);
                setSuccessMessage('');
              }}
              className="w-full px-4 py-3 rounded-xl bg-accent-gradient-1 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {t('common.continue') || 'Continue'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md bg-bg-primary rounded-2xl shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-bg-secondary flex items-center justify-center transition-colors"
            aria-label={t('common.closeModal')}
          >
            <X className="w-5 h-5 text-text-secondary" aria-hidden="true" />
          </button>

          <div className="text-center space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-text-primary">
              {isSignIn ? t('common.signIn') : t('common.signUp')}
            </h2>
            <p className="text-text-secondary">
              {isSignIn ? t('common.hasAccount') : t('common.noAccount')}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-bg-secondary transition-colors"
              onClick={() => handleOAuthSignIn('google')}
              aria-label={t('common.signInWithGoogle')}
            >
              <GoogleLogoComponent aria-hidden="true" />
              <span className="font-medium text-text-primary">
                {t('common.continueWithGoogle')}
              </span>
            </button>

            <button
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-bg-secondary transition-colors"
              onClick={() => handleOAuthSignIn('github')}
              aria-label={t('common.signInWithGithub')}
            >
              <Github className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium text-text-primary">
                {t('common.continueWithGithub')}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-bg-primary text-text-tertiary text-sm">
                {t('common.orContinueWith')}
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                {t('common.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary"
                placeholder="you@example.com"
                aria-required="true"
                aria-invalid={errorMessage ? 'true' : 'false'}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                  {t('common.password')}
                </label>
                {isSignIn && (
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="text-sm text-accent-primary hover:underline disabled:opacity-50"
                    aria-label={t('common.resetPassword')}
                  >
                    {t('common.forgotPassword')}
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary pr-10"
                  placeholder="••••••••"
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary"
                  aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="text-sm text-error p-3 bg-error/10 rounded-lg">{errorMessage}</div>
            )}

            {!isSignIn && (
              <div className="text-xs text-text-tertiary">
                {t('auth.termsAgreement') ||
                  'By signing up, you agree to our Terms and Privacy Policy.'}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-xl bg-accent-gradient-1 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span className="sr-only">{t('common.loading')}</span>
                </>
              ) : isSignIn ? (
                t('common.signIn')
              ) : (
                t('common.signUp')
              )}
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-text-secondary">
            {isSignIn ? t('common.noAccount') : t('common.hasAccount')}{' '}
            <button
              type="button"
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-accent-primary font-medium hover:underline"
            >
              {isSignIn ? t('common.signUp') : t('common.signIn')}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;
