import { Link, useLocation } from 'react-router-dom'
import { Home, MessageSquare, History, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export default function BottomNav() {
  const location = useLocation()
  const { sessionProduct } = useStore()

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { 
      path: '/chat', 
      label: 'Chat', 
      icon: MessageSquare, 
      badge: sessionProduct && sessionProduct !== 'Detecting...' ? 'Active' : null 
    },
    { path: '/history', label: 'History', icon: History },
    { path: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
      <nav className="flex items-center justify-around py-3 px-6 glass rounded-2xl border border-primary/20 shadow-2xl backdrop-blur-md">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center p-2 text-text-main/70 hover:text-accent transition-colors duration-200"
            >
              {/* Active Glow Background */}
              {isActive && (
                <motion.span
                  layoutId="activeNav"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 bg-primary/10 rounded-xl -z-10 border border-primary/30"
                  style={{
                    boxShadow: '0 0 10px rgba(108, 99, 255, 0.2)'
                  }}
                />
              )}

              {/* Icon */}
              <Icon 
                size={22} 
                className={`${isActive ? 'text-accent' : 'text-white/60'} transition-colors duration-200`}
              />

              {/* Label */}
              <span className={`text-[10px] mt-1 font-medium tracking-wide ${isActive ? 'text-white font-semibold' : 'text-white/40'}`}>
                {item.label}
              </span>

              {/* Badge indicator */}
              {item.badge && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
