import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';
import { useTheme } from './hooks/useTheme';
import { useAuthStore } from './store/authStore';
import { initYandexMetrika, trackPageView } from './lib/analytics';
import { Project } from './types/api.types';
import { queryClient } from './lib/query/queryClient';
import Header from './components/landing/Header';
import HeroSection from './components/landing/HeroSection';
import MarketProblems from './components/landing/MarketProblems';
import SolutionBenefits from './components/landing/SolutionBenefits';
import PetProject from './components/landing/PetProject';
import Footer from './components/landing/Footer';
import AuthModal from './components/auth/AuthModal';
import { LazyTodoDashboardPage, LazyProjectViewPage } from './pages/LazyPages';

import { profileAPI } from './lib/api/profile.api';
import { UserProfile } from './types/api.types';
import NetworkStatus from './components/common/NetworkStatus';
import ProfileSettings from './components/layout/ProfileSettings';

function App() {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const { user, loading, checkSession } = useAuthStore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [currentView, setCurrentView] = useState<'dashboard' | 'project'>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleSignIn = () => {
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await useAuthStore.getState().signOut();
    setUserProfile(null);
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('project');
  };

  const handleOpenProfileSettings = () => {
    setShowProfileSettings(true);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedProject(null);
  };

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const profile = await profileAPI.getProfile(user.id);
          setUserProfile(profile);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
    };
    fetchProfile();
  }, [user]);

  // Инициализация Яндекс.Метрики
  useEffect(() => {
    if (import.meta.env.PROD && import.meta.env.VITE_YM_COUNTER_ID) {
      initYandexMetrika(import.meta.env.VITE_YM_COUNTER_ID);
      trackPageView();
    }
  }, [import.meta.env.VITE_YM_COUNTER_ID]);

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
      return (
        <>
          <LazyProjectViewPage project={selectedProject} onBack={handleBackToDashboard} />
          <Toaster
            position="bottom-right"
            theme={theme === 'dark' ? 'dark' : 'light'}
            richColors
            closeButton
          />
        </>
      );
    }
    return (
      <>
        <LazyTodoDashboardPage onSignOut={handleSignOut} onProjectSelect={handleProjectSelect} />
        <Toaster
          position="bottom-right"
          theme={theme === 'dark' ? 'dark' : 'light'}
          richColors
          closeButton
        />
      </>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`min-h-screen bg-bg-primary text-text-primary ${theme}`}>
        <Header
          user={user}
          userProfile={userProfile}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onChangeLanguage={changeLanguage}
          onToggleTheme={toggleTheme}
          currentTheme={theme}
          onOpenProfileSettings={handleOpenProfileSettings}
        />
        <main>
          <HeroSection />
          <MarketProblems />
          <SolutionBenefits />
          <PetProject />
        </main>
        <Footer />
        {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
        {showProfileSettings && (
          <ProfileSettings
            isOpen={showProfileSettings}
            onClose={() => setShowProfileSettings(false)}
          />
        )}
        <Toaster
          position="bottom-right"
          theme={theme === 'dark' ? 'dark' : 'light'}
          richColors
          closeButton
        />
        <NetworkStatus />
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
