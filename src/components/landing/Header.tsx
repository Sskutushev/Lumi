import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { User } from '@supabase/supabase-js';
import { UserProfile } from '../../types/api.types';
import engFlag from '../../assets/images/flags/eng.svg';
import rusFlag from '../../assets/images/flags/rus.svg';

interface HeaderProps {
  user: User | null;
  userProfile: UserProfile | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onChangeLanguage: (lng: string) => void;
  onToggleTheme: () => void;
  currentTheme: string;
  onOpenProfileSettings?: () => void;
}

const Header = ({
  user,
  userProfile,
  onSignIn,
  onSignOut,
  onChangeLanguage,
  onToggleTheme,
  currentTheme,
  onOpenProfileSettings,
}: HeaderProps) => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ru' : 'en';
    onChangeLanguage(newLang);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full ${isMenuOpen ? 'bg-bg-primary' : 'bg-bg-primary/80 backdrop-blur-xl'} border-b border-border/30 py-4`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-animated flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold text-gradient-animated bg-clip-text">Lumi</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#problems"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
            >
              {t('landing.problems.title')}
            </a>
            <a
              href="#solution"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
            >
              {t('landing.solution.title')}
            </a>
            <a
              href="#pet-project"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
            >
              {t('landing.petProject.title')}
            </a>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg hover:bg-bg-secondary transition-colors flex items-center justify-center"
              aria-label={t('common.toggleLanguage')}
            >
              {i18n.language === 'en' ? (
                <img src={rusFlag} alt="Russian" className="w-5 h-5" />
              ) : (
                <img src={engFlag} alt="English" className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
              aria-label={currentTheme === 'light' ? t('common.darkTheme') : t('common.lightTheme')}
            >
              {currentTheme === 'light' ? (
                <Moon className="w-5 h-5 text-text-secondary" />
              ) : (
                <Sun className="w-5 h-5 text-text-secondary" />
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label={t('common.openUserMenu', 'Open user menu')}
                  className="w-10 h-10 rounded-full bg-accent-gradient-1 flex items-center justify-center text-white font-medium overflow-hidden"
                >
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
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
                      className="absolute right-0 mt-2 w-48 bg-bg-primary rounded-xl shadow-xl border border-border py-2 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          if (onOpenProfileSettings) {
                            onOpenProfileSettings();
                          }
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-bg-secondary text-text-primary text-sm flex items-center gap-3"
                      >
                        {t('profile.settings')}
                      </button>

                      <button
                        onClick={() => {
                          onToggleTheme();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-bg-secondary text-text-primary text-sm flex items-center gap-3"
                      >
                        {currentTheme === 'light' ? t('common.darkTheme') : t('common.lightTheme')}
                      </button>

                      <button
                        onClick={() => {
                          toggleLanguage();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-bg-secondary text-text-primary text-sm flex items-center gap-3"
                      >
                        {i18n.language === 'en' ? t('common.russian') : t('common.english')}
                      </button>

                      <hr className="my-2 border-border" />

                      <button
                        onClick={onSignOut}
                        className="w-full text-left px-4 py-2.5 hover:bg-error/10 text-error text-sm flex items-center gap-3"
                      >
                        {t('common.logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="px-4 py-2 rounded-lg bg-gradient-animated text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 min-w-[120px]"
              >
                {t('common.signIn')}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
              aria-label={t('common.openNavigationMenu', 'Open navigation menu')}
            >
              <Menu className="w-6 h-6 text-text-secondary" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed top-20 inset-x-0 bottom-0 bg-bg-primary z-50"
          >
            <div className="flex justify-end px-4 pb-4">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
                aria-label={t('common.close')}
              >
                <X className="w-6 h-6 text-text-secondary" />
              </button>
            </div>

            <nav className="flex flex-col items-center gap-6 py-6">
              <a
                href="#problems"
                className="text-lg font-medium text-text-secondary hover:text-text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('landing.problems.title')}
              </a>
              <a
                href="#solution"
                className="text-lg font-medium text-text-secondary hover:text-text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('landing.solution.title')}
              </a>
              <a
                href="#pet-project"
                className="text-lg font-medium text-text-secondary hover:text-text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('landing.petProject.title')}
              </a>

              <div className="flex flex-col gap-4 w-full max-w-xs mt-8">
                <button
                  onClick={toggleLanguage}
                  className="px-4 py-2 rounded-lg bg-bg-secondary hover:bg-bg-tertiary transition-colors flex items-center justify-center gap-2"
                >
                  {i18n.language === 'en' ? (
                    <>
                      <img src={rusFlag} alt="Russian" className="w-5 h-5" />
                      {t('common.russian')}
                    </>
                  ) : (
                    <>
                      <img src={engFlag} alt="English" className="w-5 h-5" />
                      {t('common.english')}
                    </>
                  )}
                </button>

                <button
                  onClick={onToggleTheme}
                  className="px-4 py-2 rounded-lg bg-bg-secondary hover:bg-bg-tertiary transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  {currentTheme === 'light' ? (
                    <>
                      <Moon className="w-4 h-4" /> {t('common.darkTheme')}
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4" /> {t('common.lightTheme')}
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    onSignIn();
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-animated text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 min-w-[120px]"
                >
                  {t('common.signIn')}
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
