import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from './hooks/useTheme';
import { useAuthStore } from './store/authStore';
import Header from './components/landing/Header';
import HeroSection from './components/landing/HeroSection';
import MarketProblems from './components/landing/MarketProblems';
import SolutionBenefits from './components/landing/SolutionBenefits';
import PetProject from './components/landing/PetProject';
import Footer from './components/landing/Footer';
import AuthModal from './components/auth/AuthModal';
import TodoDashboard from './pages/TodoDashboard';
import ProjectView from './pages/ProjectView';

function App() {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const { user, loading, checkSession } = useAuthStore();
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [currentView, setCurrentView] = useState<'dashboard' | 'project'>('dashboard');
  const [selectedProject, setSelectedProject] = useState<{ id: string; name: string; description: string } | null>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleSignIn = () => {
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await useAuthStore.getState().signOut();
  };

  const handleProjectSelect = (project: { id: string; name: string; description: string }) => {
    setSelectedProject(project);
    setCurrentView('project');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedProject(null);
  };

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
          <p className="mt-4 text-text-tertiary">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    if (currentView === 'project' && selectedProject) {
      return <ProjectView project={selectedProject} onBack={handleBackToDashboard} />;
    }
    return (
      <TodoDashboard
        onSignOut={handleSignOut}
        onProjectSelect={handleProjectSelect}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-bg-primary text-text-primary ${theme}`}>
      <Header 
        onSignIn={handleSignIn} 
        onChangeLanguage={changeLanguage} 
        onToggleTheme={toggleTheme} 
        currentTheme={theme} 
      />
      <main>
        <HeroSection />
        <MarketProblems />
        <SolutionBenefits />
        <PetProject />
      </main>
      <Footer />
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;