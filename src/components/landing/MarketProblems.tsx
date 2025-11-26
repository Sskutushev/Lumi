import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertTriangle, DollarSign, Settings } from 'lucide-react';

const MarketProblems = () => {
  const { t } = useTranslation();

  const problems = [
    {
      icon: AlertTriangle,
      title: t('landing.problems.complexity.title'),
      description: t('landing.problems.complexity.description'),
    },
    {
      icon: DollarSign,
      title: t('landing.problems.pricing.title'),
      description: t('landing.problems.pricing.description'),
    },
    {
      icon: Settings,
      title: t('landing.problems.clutter.title'),
      description: t('landing.problems.clutter.description'),
    },
  ];

  return (
    <section id="problems" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t('landing.problems.title')}
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            {t('landing.problems.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-bg-secondary/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:bg-bg-tertiary/50 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-error/10 text-error flex items-center justify-center mb-6 group-hover:bg-error/20 transition-colors">
                <problem.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-4">
                {problem.title}
              </h3>
              <p className="text-text-secondary">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketProblems;