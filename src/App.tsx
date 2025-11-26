import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from './hooks/useTheme'
import Header from './components/landing/Header'
import HeroSection from './components/landing/HeroSection'
import MarketProblems from './components/landing/MarketProblems'
import SolutionBenefits from './components/landing/SolutionBenefits'
import PetProject from './components/landing/PetProject'
import Footer from './components/landing/Footer'
import AuthModal from './components/auth/AuthModal'
import TodoDashboard from './pages/TodoDashboard'

function App() {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const handleSignIn = () => {
    setAuthModalOpen(true)
  }

  const handleAuthSuccess = () => {
    setAuthModalOpen(false)
    setIsAuthenticated(true)
  }

  if (isAuthenticated) {
    return <TodoDashboard />
  }

  return (
    <div className={`min-h-screen bg-bg-primary text-text-primary ${theme}`}>
      <Header onSignIn={handleSignIn} onChangeLanguage={changeLanguage} onToggleTheme={toggleTheme} currentTheme={theme} />
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
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  )
}

export default App