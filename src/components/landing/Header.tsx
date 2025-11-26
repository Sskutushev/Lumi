import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Menu, X, Github, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onSignIn: () => void;
  onChangeLanguage: (lng: string) => void;
  onToggleTheme: () => void;
  currentTheme: string;
}

const Header = ({ onSignIn, onChangeLanguage, onToggleTheme, currentTheme }: HeaderProps) => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ru' : 'en';
    onChangeLanguage(newLang);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-bg-primary/80 backdrop-blur-xl border-b border-border/30 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-accent-gradient-1 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
              Lumi
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#problems" className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">
              {t('landing.problems.title')}
            </a>
            <a href="#solution" className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">
              {t('landing.solution.title')}
            </a>
            <a href="#pet-project" className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">
              {t('landing.petProject.title')}
            </a>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-lg bg-bg-secondary hover:bg-bg-tertiary transition-colors text-sm font-medium"
            >
              {i18n.language === 'en' ? 'RU' : 'EN'}
            </button>
            
            <button 
              onClick={onToggleTheme}
              className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
            >
              {currentTheme === 'light' ? 
                <Moon className="w-5 h-5 text-text-secondary" /> : 
                <Sun className="w-5 h-5 text-text-secondary" />
              }
            </button>
            
            <button 
              onClick={onSignIn}
              className="px-4 py-2 rounded-lg bg-accent-gradient-1 text-white font-medium shadow-sm hover:shadow-md transition-all"
            >
              {t('common.signIn')}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
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
            className="md:hidden fixed inset-0 bg-bg-primary/95 backdrop-blur-xl z-50 pt-20"
          >
            <div className="flex justify-end px-4 pb-4">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
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
                  className="px-4 py-2 rounded-lg bg-bg-secondary hover:bg-bg-tertiary transition-colors text-sm font-medium"
                >
                  {i18n.language === 'en' ? 'Русский' : 'English'}
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
                  className="px-4 py-2 rounded-lg bg-accent-gradient-1 text-white font-medium shadow-sm hover:shadow-md transition-all"
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