import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// Import images
import complexityImg from '../../assets/images/complexity.png';
import pricingImg from '../../assets/images/pricing.png';
import interfaceImg from '../../assets/images/interface.png';

const MarketProblems = () => {
  const { t } = useTranslation();

  const problems = [
    {
      img: complexityImg,
      title: t('landing.problems.complexity.title'),
      description: t('landing.problems.complexity.description'),
    },
    {
      img: pricingImg,
      title: t('landing.problems.pricing.title'),
      description: t('landing.problems.pricing.description'),
    },
    {
      img: interfaceImg,
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
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <img src={problem.img} alt={problem.title} className="w-10 h-10 object-contain" />
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