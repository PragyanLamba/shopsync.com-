import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Link2, Search, Zap, History } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function Home() {
  const [activeTab, setActiveTab] = useState('link') // 'name' | 'link'
  const [inputValue, setInputValue] = useState('')
  const { startSearchSession, searchHistory, user } = useStore()
  const navigate = useNavigate()

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    await startSearchSession(inputValue)
    navigate('/chat')
  }

  const handleRecentClick = async (query) => {
    await startSearchSession(query)
    navigate('/chat')
  }

  return (
    <div className="min-h-screen bg-grid pb-32 flex flex-col justify-center px-4">
      <div className="max-w-4xl w-full mx-auto text-center space-y-12">
        {/* Hero Headers */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full glass border border-accent/30 text-xs font-semibold uppercase tracking-wider text-accent"
          >
            <Zap size={14} className="animate-pulse" />
            <span>Next-Gen Shopping AI</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold font-display tracking-tight leading-none bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent"
          >
            Find Anything. <br className="hidden sm:inline" />
            Everywhere. Instantly.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg sm:text-xl text-text-main/70 max-w-xl mx-auto font-light"
          >
            AI that finds your exact product with your exact requirements. No guessing. Strict filtering only.
          </motion.p>
        </div>

        {/* Input Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-2xl mx-auto glass rounded-3xl p-6 sm:p-8 border border-primary/20 shadow-2xl relative"
        >
          {/* Neon Border Glow */}
          <div className="absolute inset-0 rounded-3xl -z-10 bg-gradient-to-r from-primary/10 to-accent/10 blur-xl opacity-70" />

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative flex items-center">
              <input
                type="url"
                required
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Paste Amazon, Flipkart, Nike, or other product link..."
                className="w-full pl-6 pr-16 py-4 rounded-2xl bg-black/60 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-accent transition-all duration-300 text-base sm:text-lg focus:ring-1 focus:ring-accent"
              />
              <button
                type="submit"
                className="absolute right-3 p-3 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-secondary text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Zap size={20} />
              </button>
            </div>
          </form>

          {/* Help instructions */}
          <p className="text-xs text-white/40 mt-4">
            Our AI will extract the details from the URL and guide you through matching criteria.
          </p>
        </motion.div>

        {/* Recent Searches (Filtered to show if history has items) */}
        {searchHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-full max-w-2xl mx-auto space-y-4 text-left"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-main/50 flex items-center space-x-2">
              <History size={16} />
              <span>Recent Searches</span>
            </h3>

            <div className="flex flex-wrap gap-2.5">
              {searchHistory.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleRecentClick(item.product_name)}
                  className="px-4 py-2 rounded-xl glass hover:bg-primary/20 hover:border-primary/50 text-sm transition-all duration-200 text-white/80 hover:text-white"
                >
                  {item.product_name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
