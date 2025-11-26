import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Code, Coffee, Sparkles } from 'lucide-react';

const PetProject = () => {
  const { t } = useTranslation();

  return (
    <section id="pet-project" className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-primary/10 text-accent-primary text-sm font-medium mb-6"
        >
          <Coffee className="w-4 h-4" />
          <span>{t('landing.petProject.title')}</span>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-text-primary mb-6"
        >
          {t('landing.petProject.subtitle')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-xl text-text-secondary mb-12 max-w-3xl mx-auto"
        >
          {t('landing.petProject.description')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="bg-bg-secondary/50 backdrop-blur-sm border border-border rounded-2xl p-8 max-w-2xl mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent-gradient-1 flex items-center justify-center mx-auto mb-6">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-4">Open Source</h3>
          <p className="text-text-secondary mb-6">
            This project is completely open source and available on GitHub for anyone to explore.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-4 py-2 rounded-lg bg-bg-tertiary text-text-secondary text-sm">
              React & TypeScript
            </div>
            <div className="px-4 py-2 rounded-lg bg-bg-tertiary text-text-secondary text-sm">
              Supabase Backend
            </div>
            <div className="px-4 py-2 rounded-lg bg-bg-tertiary text-text-secondary text-sm">
              Free to Use
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PetProject;