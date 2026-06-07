import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useStore } from './store/useStore'

// Pages
import Home from './pages/Home'
import Chat from './pages/Chat'
import Results from './pages/Results'
import History from './pages/History'
import Profile from './pages/Profile'

// Components
import ParticleBackground from './components/ParticleBackground'
import BottomNav from './components/BottomNav'

function AppContent() {
  const location = useLocation()
  const { checkUser, loadHistory, user } = useStore()

  // Run Auth check & load profile/history on startup
  useEffect(() => {
    checkUser()
  }, [checkUser])

  useEffect(() => {
    if (user) {
      loadHistory()
    }
  }, [user, loadHistory])

  // Hide BottomNav on full-screen chat page
  const showBottomNav = location.pathname !== '/chat'

  return (
    <div className="relative min-h-screen">
      {/* Dynamic Cyber particle & grid background */}
      <ParticleBackground />

      {/* Routed Pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/results" element={<Results />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>

      {/* Sticking Nav Bar */}
      {showBottomNav && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}
