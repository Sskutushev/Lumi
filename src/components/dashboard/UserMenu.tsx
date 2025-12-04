import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Sun, Moon, Globe } from 'lucide-react';
import { UserProfile } from '../../types/api.types';
import { useClickOutside } from '../../hooks/useClickOutside';

interface UserMenuProps {
  userProfile: UserProfile | null;
  user: any; // User type from auth
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: (open: boolean) => void;
  onSignOut: () => void;
  onOpenProfileSettings: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
  userProfile,
  user,
  isUserMenuOpen,
  setIsUserMenuOpen,
  onSignOut,
  onOpenProfileSettings,
}) => {
  const { t, i18n } = useTranslation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(userMenuRef, () => setIsUserMenuOpen(false));

  return (
    <div className="relative" ref={userMenuRef}>
      <button
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        className="w-10 h-10 rounded-full bg-accent-gradient-1 flex items-center justify-center text-white font-medium overflow-hidden"
        aria-label={t('common.openUserMenu', 'Open user menu')}
      >
        {userProfile?.avatar_url ? (
          <img
            src={userProfile.avatar_url}
            alt="User Avatar"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          user?.email?.charAt(0).toUpperCase() || 'U'
        )}
      </button>
      <AnimatePresence>
        {isUserMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-60 sm:w-64 bg-bg-primary rounded-xl shadow-xl border border-border py-2 z-50"
            style={{
              left: 'auto',
              right: 0,
            }}
          >
            <button
              onClick={() => {
                onOpenProfileSettings();
                setIsUserMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-bg-secondary text-text-primary text-sm flex items-center gap-3"
            >
              <User className="w-4 h-4" /> {t('profile.settings')}
            </button>
            <button
              onClick={() => {
                document.documentElement.classList.toggle('dark');
                setIsUserMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-bg-secondary text-text-primary text-sm flex items-center gap-3"
            >
              {document.documentElement.classList.contains('dark') ? (
                <>
                  <Sun className="w-4 h-4" />
                  {t('common.lightTheme')}
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  {t('common.darkTheme')}
                </>
              )}
            </button>
            <button
              onClick={() => {
                i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en');
                setIsUserMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-bg-secondary text-text-primary text-sm flex items-center gap-3"
            >
              <Globe className="w-4 h-4" />{' '}
              {i18n.language === 'en' ? t('common.russian') : t('common.english')}
            </button>
            <hr className="my-2 border-border" />
            <button
              onClick={onSignOut}
              className="w-full text-left px-4 py-2.5 hover:bg-error/10 text-error text-sm flex items-center gap-3"
            >
              <LogOut className="w-4 h-4" /> {t('common.logout')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
