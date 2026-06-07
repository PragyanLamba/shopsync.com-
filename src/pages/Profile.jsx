import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, LogOut, Key, Eye, EyeOff, Save, CheckCircle, UserCheck, Shirt, HardDrive } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function Profile() {
  const {
    user,
    preferredSizes,
    updatePreferredSizes,
    geminiKey,
    setGeminiKey,
    loginWithGoogle,
    logout
  } = useStore()

  // Local states for inputs
  const [localKey, setLocalKey] = useState(geminiKey)
  const [showKey, setShowKey] = useState(false)
  const [keySaved, setKeySaved] = useState(false)

  // Size category inputs
  const [shoeSize, setShoeSize] = useState(preferredSizes.shoes || '')
  const [shirtSize, setShirtSize] = useState(preferredSizes.clothing || '')
  const [laptopRam, setLaptopRam] = useState(preferredSizes.laptop || '')
  const [phoneStorage, setPhoneStorage] = useState(preferredSizes.phone || '')
  const [sizeSaved, setSizeSaved] = useState(false)

  const handleSaveKey = (e) => {
    e.preventDefault()
    setGeminiKey(localKey)
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
  }

  const handleSaveSizes = (e) => {
    e.preventDefault()
    updatePreferredSizes({
      shoes: shoeSize,
      clothing: shirtSize,
      laptop: laptopRam,
      phone: phoneStorage
    })
    setSizeSaved(true)
    setTimeout(() => setSizeSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] pb-32 pt-6 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">Settings & Profile</h1>
          <p className="text-xs sm:text-sm text-white/40 font-light">Customize sizing presets and configure credentials</p>
        </div>

        {/* AUTH PANEL */}
        <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 blur-2xl -z-10" />

          {user ? (
            /* Logged In */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-accent p-0.5 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xl font-bold text-accent">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
                    <UserCheck size={16} />
                    <span>Synchronized Cloud Account</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">{user.email}</h3>
                  <p className="text-xs text-white/30">Member since {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            /* Guest / Log In CTA */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Guest Account</h3>
                <p className="text-sm text-white/50">
                  Login with Google to back up your sizing profile and view search history on any device.
                </p>
              </div>
              <button
                onClick={loginWithGoogle}
                className="px-6 py-3 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-secondary text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-3 transition hover:scale-[1.02] shadow-lg shadow-primary/20"
              >
                <LogIn size={16} />
                <span>Log In with Google</span>
              </button>
            </div>
          )}
        </div>

        {/* GEMINI CONFIG PANEL */}
        <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
          <div className="flex items-center space-x-3 text-accent border-b border-white/5 pb-3">
            <Key size={20} />
            <h2 className="text-lg font-bold text-white">Google Gemini API Configuration</h2>
          </div>

          <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
            By default, ShopSync AI uses a high-fidelity mock assistant for demonstration. Paste your **Google Gemini 1.5 Flash API Key** below to connect to the live AI engine. Your key is stored strictly on your local browser.
          </p>

          <form onSubmit={handleSaveKey} className="space-y-4">
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="Enter Gemini API Key (AIzaSy...)"
                className="w-full pl-5 pr-12 py-3 bg-black/60 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white placeholder-white/30 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 text-white/40 hover:text-white"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline"
              >
                Get a free API Key from Google AI Studio
              </a>

              <button
                type="submit"
                className="flex items-center space-x-2 px-5 py-2 bg-primary hover:bg-accent text-white rounded-xl text-xs font-bold transition duration-200"
              >
                {keySaved ? <CheckCircle size={14} className="text-emerald-400" /> : <Save size={14} />}
                <span>{keySaved ? 'Saved Key!' : 'Save Key'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* PREFERRED SIZES PANEL */}
        <div className="glass rounded-2xl p-6 border border-white/5 space-y-6">
          <div className="flex items-center space-x-3 text-accent border-b border-white/5 pb-3">
            <Shirt size={20} />
            <h2 className="text-lg font-bold text-white">Preferred Sizing Profile</h2>
          </div>

          <p className="text-xs sm:text-sm text-white/50">
            Presets configured here are injected into the chatbot. The AI will skip asking these questions and auto-fill them during your search!
          </p>

          <form onSubmit={handleSaveSizes} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Shoes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 block">Shoe Size (UK/US/EU)</label>
                <input
                  type="text"
                  value={shoeSize}
                  onChange={(e) => setShoeSize(e.target.value)}
                  placeholder="e.g. UK 9"
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white text-sm"
                />
              </div>

              {/* Clothing */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 block">Clothing Size (XS/S/M/L/XL)</label>
                <input
                  type="text"
                  value={shirtSize}
                  onChange={(e) => setShirtSize(e.target.value)}
                  placeholder="e.g. XL"
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white text-sm"
                />
              </div>

              {/* Laptops */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 block">Preferred Laptop RAM</label>
                <select
                  value={laptopRam}
                  onChange={(e) => setLaptopRam(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white text-sm"
                >
                  <option value="">No preference</option>
                  <option value="8GB">8GB RAM</option>
                  <option value="16GB">16GB RAM</option>
                  <option value="32GB">32GB RAM</option>
                  <option value="64GB">64GB RAM</option>
                </select>
              </div>

              {/* Phones */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 block">Preferred Phone Storage</label>
                <select
                  value={phoneStorage}
                  onChange={(e) => setPhoneStorage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white text-sm"
                >
                  <option value="">No preference</option>
                  <option value="128GB">128GB Storage</option>
                  <option value="256GB">256GB Storage</option>
                  <option value="512GB">512GB Storage</option>
                  <option value="1TB">1TB Storage</option>
                </select>
              </div>

            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-secondary text-white rounded-xl text-xs font-bold transition duration-200"
              >
                {sizeSaved ? <CheckCircle size={14} className="text-emerald-400" /> : <Save size={14} />}
                <span>{sizeSaved ? 'Saved Preferences!' : 'Save Sizing Profile'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
