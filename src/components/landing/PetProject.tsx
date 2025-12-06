import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Code, Coffee, Github } from 'lucide-react';

const PetProject = () => {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <section id="pet-project" className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-accent-primary/10 text-accent-primary text-base font-medium mb-6"
        >
          <div className="bg-gradient-animated w-8 h-8 rounded-full flex items-center justify-center">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-gradient-animated bg-clip-text">
            {t('landing.petProject.title')}
          </span>
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
          className="max-w-2xl mx-auto"
        >
          <div
            className={`relative cursor-pointer w-full h-80 [perspective:1000px]`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
            >
              {/* Front of card */}
              <div
                className={`absolute inset-0 bg-bg-secondary/50 backdrop-blur-sm border border-border rounded-2xl p-8 flex flex-col items-center justify-center shadow-lg shadow-accent-primary/10 hover:shadow-2xl hover:shadow-accent-primary/20 [backface-visibility:hidden]`}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent-gradient-1 flex items-center justify-center mx-auto mb-6">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-4">Open Source</h3>
                <p className="text-text-secondary mb-6 text-center">
                  This project is completely open source and available on GitHub for anyone to
                  explore.
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
              </div>

              {/* Back of card */}
              <div
                className={`absolute inset-0 bg-bg-secondary/50 backdrop-blur-sm border border-border rounded-2xl p-4 sm:p-6 flex flex-col justify-center shadow-lg shadow-accent-primary/10 hover:shadow-2xl hover:shadow-accent-primary/20 [backface-visibility:hidden] [transform:rotateY(180deg)]`}
              >
                <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                  {/* Left Column */}
                  <div className="flex flex-col gap-2 flex-1 items-center md:items-start">
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-bg-tertiary text-text-secondary text-xs sm:text-sm">
                      React & TypeScript
                    </div>
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-bg-tertiary text-text-secondary text-xs sm:text-sm">
                      Supabase Realtime
                    </div>
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-bg-tertiary text-text-secondary text-xs sm:text-sm">
                      Tailwind CSS
                    </div>
                    <a
                      href="https://github.com/Sskutushev/Lumi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-2 group relative px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-animated text-white font-semibold shadow-lg shadow-accent-primary/30 hover:shadow-xl hover:shadow-accent-primary/40 hover:scale-105 transition-all duration-300"
                    >
                      <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">GitHub</span>
                    </a>
                  </div>

                  {/* Right Column (Code) */}
                  <div className="flex-1 bg-bg-tertiary rounded-xl p-3 text-left w-full">
                    <pre className="text-[10px] sm:text-xs text-text-tertiary overflow-x-auto">
                      <code>{`// Real-time updates
supabase
  .channel('tasks')
  .on('postgres_changes', { event: '*' }, 
    () => loadTasks()
  )
  .subscribe();`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PetProject;
