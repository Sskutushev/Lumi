import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, Heart, Sun, Zap, Moon, Lock, Shield, MoreHorizontal } from 'lucide-react';

interface Benefit {
  title: string;
  description: string;
}

const SolutionBenefits = () => {
  const { t, i18n } = useTranslation();
  const [imageSrc, setImageSrc] = useState('/src/assets/images/en_light.jpg');

  // Update image source based on language and theme
  useEffect(() => {
    const updateImage = () => {
      const isDark = document.documentElement.classList.contains('dark');
      if (i18n.language === 'ru') {
        setImageSrc(isDark ? '/src/assets/images/ru_dark.jpg' : '/src/assets/images/ru_light.jpg');
      } else {
        setImageSrc(isDark ? '/src/assets/images/en_dark.jpg' : '/src/assets/images/en_light.jpg');
      }
    };

    // Initial setup
    updateImage();

    // Watch for theme changes
    const observer = new MutationObserver(updateImage);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [i18n.language]);

  // Benefits data
  const benefits: Benefit[] = [
    {
      title: t('landing.solution.simple.title'),
      description: t('landing.solution.simple.description'),
    },
    {
      title: t('landing.solution.free.title'),
      description: t('landing.solution.free.description'),
    },
    {
      title: t('landing.solution.focused.title'),
      description: t('landing.solution.focused.description'),
    },
  ];

  // Additional benefits data
  const additionalBenefits: Benefit[] = [
    {
      title: t('landing.solution.why.title'),
      description: t('landing.solution.why.description'),
    },
    {
      title: t('landing.solution.security.title'),
      description: t('landing.solution.security.description'),
    },
  ];

  return (
    <section id="solution" className="py-20 px-4 bg-bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t('landing.solution.title')}
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            {t('landing.solution.subtitle')}
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-fr">
          {/* Large Card - Features Overview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="md:col-span-3 md:row-span-2 rounded-2xl bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 border border-border p-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent-gradient-1 flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-4">
              {t('landing.solution.simple.title')}
            </h3>
            <p className="text-text-secondary mb-6">
              {t('landing.solution.simple.description')}
            </p>
            <div className="flex flex-wrap gap-2">
              {['Simple UI', 'Quick Setup', 'No Learning Curve', 'Intuitive'].map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-bg-primary/50 text-text-secondary text-sm border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Medium Card - Free Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="md:col-span-3 rounded-2xl bg-bg-elevated border border-border p-8"
          >
            <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center mb-6">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-4">
              {t('landing.solution.free.title')}
            </h3>
            <p className="text-text-secondary mb-4">
              {t('landing.solution.free.description')}
            </p>
            <div className="flex flex-wrap gap-2">
              {['All Features', 'Forever Free', 'No Limits', 'Open Source'].map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-sm border border-success/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Small Cards - Individual Benefits */}
          {benefits.slice(2).map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              viewport={{ once: true }}
              className="md:col-span-2 rounded-2xl bg-bg-elevated border border-border p-6"
            >
              <div className="w-10 h-10 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center mb-4">
                <Sun className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-text-primary mb-2">
                {benefit.title}
              </h4>
              <p className="text-sm text-text-secondary">
                {benefit.description}
              </p>
            </motion.div>
          ))}

          {/* Wide Card - Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="md:col-span-4 rounded-2xl bg-gradient-to-r from-accent-tertiary/10 to-accent-primary/10 border border-border p-8"
          >
            <h3 className="text-xl font-bold text-text-primary mb-4">
              {additionalBenefits[0].title}
            </h3>
            <p className="text-text-secondary mb-4">
              {additionalBenefits[0].description}
            </p>
            <div className="flex flex-wrap gap-3">
              {['React', 'TypeScript', 'Supabase', 'Tailwind', 'Framer Motion'].map((tech, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-bg-primary/50 text-text-secondary border border-border text-sm"
                >
                  {tech}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Small Card - Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
            className="md:col-span-2 rounded-2xl bg-bg-elevated border border-border p-6"
          >
            <div className="w-10 h-10 rounded-lg bg-info/10 text-info flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-text-primary mb-2">
              {additionalBenefits[1].title}
            </h4>
            <p className="text-sm text-text-secondary">
              {additionalBenefits[1].description}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SolutionBenefits;