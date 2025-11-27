import React from 'react';
import { useTranslation } from 'react-i18next';
import { Github, Globe, Mail, Linkedin, Send } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-accent-gradient-1 flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-lg font-bold">Lumi</span>
            </div>
            <p className="text-text-secondary text-sm mt-2">
              {t('footer.rights')}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a 
              href="https://sskutushev.site" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-bg-secondary hover:bg-bg-tertiary flex items-center justify-center transition-colors"
              aria-label="Portfolio"
            >
              <Globe className="w-5 h-5 text-text-secondary" />
            </a>
            <a 
              href="https://github.com/Sskutushev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-bg-secondary hover:bg-bg-tertiary flex items-center justify-center transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5 text-text-secondary" />
            </a>
            <a
              href="https://t.me/Sskutushev"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-bg-secondary hover:bg-bg-tertiary flex items-center justify-center transition-colors"
              aria-label="Telegram"
            >
              <Send className="w-5 h-5 text-text-secondary" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;