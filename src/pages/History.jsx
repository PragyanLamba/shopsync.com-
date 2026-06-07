import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { History as HistoryIcon, Bookmark, Play, Trash2, ExternalLink, ShieldAlert } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function History() {
  const [activeTab, setActiveTab] = useState('history') // 'history' | 'saved'
  const navigate = useNavigate()
  
  const {
    searchHistory,
    savedProducts,
    removeSavedProduct,
    startSearchSession,
    user,
    loginWithGoogle
  } = useStore()

  // Format date utility
  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (_) {
      return isoString
    }
  }

  // Re-run search session
  const handleRerun = async (query) => {
    await startSearchSession(query)
    navigate('/chat')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] pb-32 pt-6 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* PAGE HEADER */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">Your Dashboard</h1>
          <p className="text-xs sm:text-sm text-white/40">Track your requirement history and bookmarked deals</p>
        </div>

        {/* Guest Warning Banner */}
        {!user && (
          <div className="glass-secondary rounded-2xl p-4 border border-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-secondary">
              <ShieldAlert size={20} className="flex-shrink-0" />
              <p className="text-xs sm:text-sm text-white/80">
                You are searching as a **Guest**. Log in to sync searches and saved deals to your cloud account!
              </p>
            </div>
            <button
              onClick={loginWithGoogle}
              className="px-4 py-2 bg-secondary text-white rounded-xl text-xs font-bold hover:scale-[1.03] transition-all"
            >
              Log In
            </button>
          </div>
        )}

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-white/5 pb-0.5">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-6 text-sm font-semibold transition-all relative flex items-center space-x-2 ${
              activeTab === 'history' ? 'text-accent' : 'text-white/40 hover:text-white'
            }`}
          >
            <HistoryIcon size={16} />
            <span>Search History</span>
            {activeTab === 'history' && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-3 px-6 text-sm font-semibold transition-all relative flex items-center space-x-2 ${
              activeTab === 'saved' ? 'text-accent' : 'text-white/40 hover:text-white'
            }`}
          >
            <Bookmark size={16} />
            <span>Saved Deals</span>
            {activeTab === 'saved' && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div>
          {activeTab === 'history' ? (
            /* HISTORY TAB */
            <div className="space-y-4">
              {searchHistory.length > 0 ? (
                searchHistory.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/20 transition-all duration-300"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-[10px] font-semibold bg-white/5 border border-white/10 px-2 py-0.5 rounded-md uppercase tracking-wider text-white/50">
                          {item.category}
                        </span>
                        <span className="text-xs text-white/30">{formatDate(item.created_at)}</span>
                      </div>
                      
                      <h3 className="text-base font-semibold text-white">{item.product_name}</h3>
                      
                      {/* Requirements List */}
                      {item.requirements && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {Object.entries(item.requirements)
                            .filter(([_, val]) => val !== undefined && val !== '')
                            .map(([key, val], idx) => (
                              <span 
                                key={idx}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-accent/90"
                              >
                                {key.replace('_inr', '')}: {String(val)}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleRerun(item.product_name)}
                      className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary hover:bg-accent text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.03] shadow-md shadow-primary/20"
                    >
                      <Play size={12} fill="currentColor" />
                      <span>Re-run Search</span>
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="glass rounded-2xl p-12 text-center border border-white/5 text-white/40 text-sm">
                  No previous searches found. Start a search on the Home page!
                </div>
              )}
            </div>
          ) : (
            /* SAVED DEALS TAB */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedProducts.length > 0 ? (
                savedProducts.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-5 border border-white/5 flex flex-col justify-between h-[180px] hover:border-secondary/20 transition-all duration-300"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-white/40">{item.site_name}</span>
                        <button
                          onClick={() => removeSavedProduct(item.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/30 hover:text-red-400 border border-transparent hover:border-red-500/20 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      <h3 className="text-sm font-semibold text-white line-clamp-2">{item.product_name}</h3>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                      <span className="text-base font-bold text-accent font-display">{item.price}</span>
                      
                      <a
                        href={item.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary-hover text-white rounded-lg text-xs font-bold transition-all hover:scale-[1.03]"
                      >
                        <span>Buy Deal</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 glass rounded-2xl p-12 text-center border border-white/5 text-white/40 text-sm">
                  No saved deals yet. Save deals from your search results!
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
