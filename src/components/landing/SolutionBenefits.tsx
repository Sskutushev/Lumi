import { useTranslation } from 'react-i18next';
import { motion, Variants } from 'framer-motion';
import useReducedMotion from '../../hooks/useReducedMotion';

import simpleImg from '../../assets/images/simple.png';
import freeImg from '../../assets/images/free.png';
import focusImg from '../../assets/images/focus.png';
import whyImg from '../../assets/images/why.png';
import secureImg from '../../assets/images/secure.png';

interface Benefit {
  title: string;
  description: string;
}

const SolutionBenefits = () => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();

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

  // Animation variants for puzzle assembly effect
  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 50,
        damping: 15,
        delay: i * 0.1,
        duration: 0.8,
      },
    }),
  };

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 auto-rows-fr">
          {/* Large Card - Features Overview */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial={reducedMotion ? 'hidden' : 'hidden'}
            whileInView={reducedMotion ? 'visible' : 'visible'}
            viewport={{ once: true }}
            className="md:col-span-2 rounded-xl bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 border border-border p-3 flex flex-col justify-center text-left"
          >
            <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center mb-2 flex-shrink-0">
              <img src={simpleImg} alt="Simple" className="w-24 h-24 object-contain" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">
              {t('landing.solution.simple.title')}
            </h3>
            <p className="text-text-secondary mb-2 text-sm">
              {t('landing.solution.simple.description')}
            </p>
            <div className="flex flex-wrap justify-start gap-1">
              {['Simple UI', 'Quick Setup', 'No Learning Curve', 'Intuitive'].map((tag, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-bg-primary/50 text-text-secondary border border-border text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Medium Card - Free Benefits */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial={reducedMotion ? 'hidden' : 'hidden'}
            whileInView={reducedMotion ? 'visible' : 'visible'}
            viewport={{ once: true }}
            className="md:col-span-2 rounded-xl bg-bg-elevated border border-border p-3 flex flex-col justify-center text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-2 flex-shrink-0">
              <img src={freeImg} alt="Free" className="w-16 h-16 object-contain" />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-1">
              {t('landing.solution.free.title')}
            </h3>
            <p className="text-text-secondary mb-2 text-xs">
              {t('landing.solution.free.description')}
            </p>
            <div className="flex flex-wrap justify-start gap-1">
              {['All Features', 'Forever Free', 'No Limits', 'Open Source'].map((tag, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/20 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Small Cards - Individual Benefits */}
          <motion.div
            custom={2}
            variants={cardVariants}
            initial={reducedMotion ? 'hidden' : 'hidden'}
            whileInView={reducedMotion ? 'visible' : 'visible'}
            viewport={{ once: true }}
            className="md:col-span-1 rounded-xl bg-bg-elevated border border-border p-2 flex flex-col justify-center text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-1 flex-shrink-0">
              <img src={focusImg} alt="Focus" className="w-14 h-14 object-contain" />
            </div>
            <h4 className="font-bold text-text-primary mb-1 text-base">{benefits[2].title}</h4>
            <p className="text-text-secondary text-xs">{benefits[2].description}</p>
          </motion.div>

          {/* Wide Card - Additional Info */}
          <motion.div
            custom={3}
            variants={cardVariants}
            initial={reducedMotion ? 'hidden' : 'hidden'}
            whileInView={reducedMotion ? 'visible' : 'visible'}
            viewport={{ once: true }}
            className="md:col-span-2 rounded-xl bg-gradient-to-r from-accent-tertiary/10 to-accent-primary/10 border border-border p-3 flex flex-col justify-center text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-2 flex-shrink-0">
              <img src={whyImg} alt="Why Lumi" className="w-16 h-16 object-contain" />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2">
              {additionalBenefits[0].title}
            </h3>
            <p className="text-text-secondary mb-2 text-xs">{additionalBenefits[0].description}</p>
            <div className="flex flex-wrap justify-start gap-1">
              {['React', 'TypeScript', 'Supabase', 'Tailwind', 'Framer Motion'].map((tech, idx) => (
                <div
                  key={idx}
                  className="px-2 py-1 rounded bg-bg-primary/50 text-text-secondary border border-border text-xs"
                >
                  {tech}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Small Card - Security */}
          <motion.div
            custom={4}
            variants={cardVariants}
            initial={reducedMotion ? false : 'hidden'}
            whileInView={reducedMotion ? false : 'visible'}
            viewport={{ once: true }}
            className="md:col-span-1 rounded-xl bg-bg-elevated border border-border p-2 flex flex-col justify-center text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-1 flex-shrink-0">
              <img src={secureImg} alt="Security" className="w-14 h-14 object-contain" />
            </div>
            <h4 className="font-bold text-text-primary mb-1 text-base">
              {additionalBenefits[1].title}
            </h4>
            <p className="text-text-secondary text-xs">{additionalBenefits[1].description}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SolutionBenefits;
