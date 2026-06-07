import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowLeft, Sparkles, CheckCircle, Database } from 'lucide-react'
import { useStore } from '../store/useStore'
import GlowingOrb from '../components/GlowingOrb'
import SkeletonLoader from '../components/SkeletonLoader'

export default function Chat() {
  const [textInput, setTextInput] = useState('')
  const chatEndRef = useRef(null)
  const navigate = useNavigate()
  
  const {
    sessionProduct,
    sessionCategory,
    sessionRequirements,
    chatMessages,
    isSearching,
    isGeneratingResults,
    searchComplete,
    sendChatMessage,
    refineRequirements
  } = useStore()

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isSearching])

  // Redirect to Results when search completes
  useEffect(() => {
    if (searchComplete) {
      navigate('/results')
    }
  }, [searchComplete, navigate])

  const handleSend = (e) => {
    e.preventDefault()
    if (!textInput.trim() || isSearching) return
    
    sendChatMessage(textInput)
    setTextInput('')
  }

  // Calculate requirement progress
  const getProgress = () => {
    const keys = {
      shoes: ['size', 'color', 'max_budget_inr', 'condition'],
      phone: ['storage', 'color', 'condition', 'max_budget_inr', 'carrier'],
      laptop: ['ram', 'processor', 'storage', 'screen_size', 'max_budget_inr'],
      clothing: ['size', 'color', 'material', 'max_budget_inr'],
      headphones: ['connection', 'anc', 'style', 'max_budget_inr']
    }

    const expected = keys[sessionCategory] || ['description', 'size', 'max_budget_inr']
    const gathered = expected.filter(k => sessionRequirements[k] !== undefined && sessionRequirements[k] !== '')
    
    return {
      percentage: Math.round((gathered.length / expected.length) * 100),
      count: gathered.length,
      total: expected.length
    }
  }

  const progress = getProgress()

  return (
    <div className="h-screen bg-[#0A0A0F] text-white flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl -z-10 animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent/5 blur-3xl -z-10 animate-pulse-slow" />

      {/* HEADER NAVBAR */}
      <header className="glass border-b border-white/5 py-4 px-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 hover:bg-white/5 rounded-xl transition text-white/60 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold bg-primary/20 border border-primary/40 text-accent px-2 py-0.5 rounded-full uppercase tracking-wider">
                {sessionCategory || 'Detecting...'}
              </span>
              <span className="text-sm font-display font-medium text-white truncate max-w-[150px] sm:max-w-[300px]">
                {sessionProduct}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar (Header) */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-white/40 block">Requirements</span>
            <span className="text-xs font-bold text-accent">{progress.count}/{progress.total} Gathered</span>
          </div>
          <div className="w-20 sm:w-28 h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
        </div>
      </header>

      {/* CHAT MESSAGES PANEL */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        <AnimatePresence initial={false}>
          {chatMessages.map((msg, index) => {
            const isUser = msg.sender === 'user'
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end space-x-3`}
              >
                {/* AI Avatar */}
                {!isUser && (
                  <div className="flex-shrink-0 mb-1">
                    <GlowingOrb size="sm" isTyping={isSearching && index === chatMessages.length - 1} />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] sm:max-w-[60%] px-5 py-3.5 rounded-2xl ${
                    isUser
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-white rounded-br-none glow-primary'
                      : 'glass text-white/95 rounded-bl-none border border-white/10'
                  } shadow-lg text-sm sm:text-base leading-relaxed`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {isSearching && (
          <div className="flex items-end space-x-3">
            <div className="flex-shrink-0">
              <GlowingOrb size="sm" isTyping={true} />
            </div>
            <SkeletonLoader type="chat" />
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* INPUT FORM CONTAINER */}
      <div className="glass border-t border-white/5 p-4 sm:p-6 z-10">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center space-x-4">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isSearching}
            placeholder={
              isSearching 
                ? 'Processing details...' 
                : 'Type your requirements (size, color, budget)...'
            }
            className="flex-1 px-5 py-3.5 bg-black/60 border border-white/10 rounded-2xl focus:outline-none focus:border-accent text-white placeholder-white/30 transition duration-300 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isSearching}
            className="p-3.5 bg-primary hover:bg-accent text-white rounded-2xl shadow-lg transition duration-200 disabled:opacity-30 disabled:hover:bg-primary flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* RESULTS GENERATING LOADER SCREEN */}
      <AnimatePresence>
        {isGeneratingResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0A0A0F] z-50 flex flex-col items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-grid opacity-30 -z-10" />
            
            <div className="space-y-8 text-center max-w-md">
              <div className="flex justify-center">
                <GlowingOrb size="lg" isTyping={true} />
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold font-display bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-pulse">
                  Querying Shopping Sites...
                </h2>
                
                <div className="space-y-2 text-sm text-white/50">
                  <div className="flex items-center justify-center space-x-2 text-accent">
                    <Database size={16} className="animate-spin" />
                    <span>Verifying stock levels</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle size={16} className="text-secondary" />
                    <span>Confirming exact size availability</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles size={16} className="text-primary" />
                    <span>Filtering matching criteria only</span>
                  </div>
                </div>
              </div>

              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-gradient-to-r from-primary via-accent to-secondary w-full animate-[shimmer_2s_infinite]" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
