import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Github, Mail, Loader2, GoogleLogo } from 'lucide-react';
import { motion } from 'framer-motion';

// Simple Google logo component
const GoogleLogo = () => (
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
  onAuthSuccess?: () => void;
}

const AuthModal = ({ onClose, onAuthSuccess }: AuthModalProps) => {
  const { t } = useTranslation();
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onClose();
      if (onAuthSuccess) {
        onAuthSuccess();
      }
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md bg-bg-primary rounded-2xl shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>

          <div className="text-center space-y-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-accent-gradient-1 flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-xl">L</span>
            </div>
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
              onClick={() => console.log('Sign in with Google')}
            >
              <GoogleLogo />
              <span className="font-medium text-text-primary">
                {t('common.continueWithGoogle')}
              </span>
            </button>

            <button
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-bg-secondary transition-colors"
              onClick={() => console.log('Sign in with GitHub')}
            >
              <Github className="w-5 h-5" />
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
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('common.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('common.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary"
                placeholder="••••••••"
              />
            </div>

            {!isSignIn && (
              <div className="text-xs text-text-tertiary">
                By signing up, you agree to our Terms and Privacy Policy.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-xl bg-accent-gradient-1 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
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