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
              className="relative rounded-2xl bg-bg-secondary/50 backdrop-blur-sm border border-border p-8 hover:bg-bg-tertiary/50 transition-all duration-300 group shadow-lg shadow-accent-primary/10 hover:shadow-2xl hover:shadow-accent-primary/20"
            >
              <div className="absolute -inset-0.5 bg-gradient-animated rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300 z-0" />
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 z-10">
                  <img src={problem.img} alt={problem.title} className="w-24 h-24 object-contain" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-4 z-10">
                  {problem.title}
                </h3>
                <p className="text-text-secondary z-10">
                  {problem.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketProblems;