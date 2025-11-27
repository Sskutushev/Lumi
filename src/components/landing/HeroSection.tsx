import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useDynamicImageUpdater } from '../../hooks/useDynamicImageUpdater';

const HeroSection = () => {
  const { t, i18n } = useTranslation();
  useDynamicImageUpdater(); // Hook for updating images based on theme/language

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-accent-gradient-3 opacity-10" />
        <motion.div
          animate={{
            x: [0, 100, 50, 0],
            y: [0, -50, 100, 0],
            scale: [1, 1.2, 1, 1.1],
            rotate: [0, 0, 90, 0],
          }}
          transition={{ duration: 40, repeat: Infinity, repeatType: "mirror" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent-primary opacity-10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, -50, 0],
            y: [0, 100, -50, 0],
            scale: [1, 1.3, 1.1, 1],
            rotate: [0, 90, 0, 0],
          }}
          transition={{ duration: 45, repeat: Infinity, repeatType: "mirror" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-secondary opacity-10 blur-3xl"
        />
      </div>

      <div className="max-w-5xl mx-auto text-center space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-bg-secondary/50 backdrop-blur-sm border border-border"
        >
          <CheckCircle className="w-5 h-5 text-accent-primary" />
          <span className="text-sm font-medium text-text-secondary">{t('common.tagline')}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-10 whitespace-nowrap overflow-x-hidden" style={{ lineHeight: '1.2', overflow: 'visible' }}>
            <span className="text-gradient-animated bg-clip-text inline-block" style={{ lineHeight: '1.2', display: 'inline-block', overflow: 'visible', paddingBottom: '0.1em', whiteSpace: 'nowrap' }}>
              {t('landing.hero.title').split('.')[0]}. {t('landing.hero.title').split('.').slice(1).join('.').replace(/^[\s.]+/, '')}
            </span>
          </h1>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button className="group relative px-8 py-4 rounded-2xl bg-gradient-animated text-white font-semibold shadow-lg shadow-accent-primary/30 hover:shadow-xl hover:shadow-accent-primary/40 hover:scale-105 transition-all duration-300 min-w-[200px]">
            <span className="relative z-10 flex items-center justify-center gap-2">
              {t('landing.hero.cta')}
              <ArrowRight className="inline w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </motion.div>

        {/* Simple mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
          className="relative mt-16 max-w-4xl mx-auto"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border bg-bg-secondary/30 backdrop-blur-sm p-4">
            <div className="flex items-center gap-3 mb-4 px-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 px-4 py-1.5 rounded-lg bg-bg-tertiary text-sm text-text-tertiary text-center font-medium">
                app.lumi.todo
              </div>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden border border-border">
              <img
                id="dynamic-screenshot"
                data-ru-light="/src/assets/images/ru_light.jpg"
                data-ru-dark="/src/assets/images/ru_dark.jpg"
                data-en-light="/src/assets/images/en_light.jpg"
                data-en-dark="/src/assets/images/en_dark.jpg"
                src={
                  i18n.language === 'ru'
                    ? document.documentElement.classList.contains('dark')
                      ? '/src/assets/images/ru_dark.jpg'
                      : '/src/assets/images/ru_light.jpg'
                    : document.documentElement.classList.contains('dark')
                      ? '/src/assets/images/en_dark.jpg'
                      : '/src/assets/images/en_light.jpg'
                }
                alt="Application interface"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="absolute -bottom-1/4 -left-1/4 -right-1/4 h-1/2 -z-10 bg-gradient-to-t from-accent-primary/10 to-transparent blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;