import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw, ExternalLink, Bookmark, Check, HelpCircle } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function Results() {
  const navigate = useNavigate()
  
  const {
    sessionProduct,
    sessionRequirements,
    searchResults,
    sortOrder,
    setSortOrder,
    refineRequirements,
    saveProduct,
    savedProducts
  } = useStore()

  // Back to chat to refine
  const handleRefine = () => {
    refineRequirements()
    navigate('/chat')
  }

  // Sort logic
  const sortedResults = useMemo(() => {
    if (!searchResults) return []
    const resultsCopy = [...searchResults]
    return resultsCopy.sort((a, b) => {
      if (sortOrder === 'price-asc') {
        return a.price_numeric - b.price_numeric
      } else {
        return b.price_numeric - a.price_numeric
      }
    })
  }, [searchResults, sortOrder])

  // Helper to check if item is saved
  const isSaved = (url) => savedProducts.some(p => p.product_url === url)

  // Map requirements keys to human readable labels
  const requirementChips = useMemo(() => {
    return Object.entries(sessionRequirements)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => {
        let label = key.toUpperCase()
        if (key === 'max_budget_inr') label = 'MAX BUDGET'
        return { label, value }
      })
  }, [sessionRequirements])

  return (
    <div className="min-h-screen bg-[#0A0A0F] pb-32 pt-6 px-4 sm:px-6">
      {/* Background radial effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/chat')}
              className="p-2 hover:bg-white/5 rounded-xl transition text-white/60 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-white truncate max-w-[250px] sm:max-w-md">
                Deals for {sessionProduct}
              </h1>
              <p className="text-xs text-white/40">Showing up to 8 strictly matching results</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            {/* Sorting Dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            <button
              onClick={handleRefine}
              className="flex items-center space-x-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/40 rounded-xl text-sm font-semibold text-accent transition-all duration-200"
            >
              <RefreshCw size={14} className="animate-spin-slow" />
              <span>Refine</span>
            </button>
          </div>
        </div>

        {/* REQUIREMENT CHIPS */}
        {requirementChips.length > 0 && (
          <div className="flex flex-wrap gap-2 py-2 border-b border-white/5">
            {requirementChips.map((chip, idx) => (
              <div 
                key={idx}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-full glass border border-accent/20 text-xs text-white/80"
              >
                <span className="text-[10px] text-white/40 uppercase font-semibold">{chip.label}:</span>
                <span className="font-bold text-accent">{String(chip.value)}</span>
              </div>
            ))}
          </div>
        )}

        {/* RESULTS GRID */}
        {sortedResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedResults.map((product, idx) => {
              const saved = isSaved(product.url)
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="glass rounded-2xl p-5 border border-primary/10 hover-glow-primary flex flex-col justify-between min-h-[360px] relative transition-all duration-300"
                >
                  <div>
                    {/* favicon & site name */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2.5">
                        <img 
                          src={product.site_logo} 
                          alt={product.site_name} 
                          onError={(e) => { e.target.src = 'https://www.google.com/favicon.ico' }}
                          className="w-6 h-6 rounded-md bg-white/10 p-0.5 object-contain"
                        />
                        <span className="text-xs font-semibold text-white/50">{product.site_name}</span>
                      </div>
                      
                      {/* Save deal button */}
                      <button
                        onClick={() => saveProduct(product)}
                        disabled={saved}
                        className={`p-1.5 rounded-lg border transition ${
                          saved 
                            ? 'bg-secondary/20 border-secondary text-secondary' 
                            : 'border-white/5 hover:border-accent text-white/40 hover:text-accent bg-white/5'
                        }`}
                      >
                        <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* product title */}
                    <h3 className="text-sm font-semibold text-white line-clamp-2 mb-3">
                      {product.product_name}
                    </h3>

                    {/* Requirements Check badges */}
                    <div className="flex flex-wrap gap-1.5 mb-4 max-h-[100px] overflow-y-auto pr-1">
                      {product.matched_badges.map((badge, bIdx) => {
                        const isDirect = badge.includes("Direct")
                        return (
                          <span 
                            key={bIdx} 
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                              isDirect 
                                ? 'bg-accent/15 border border-accent/40 text-accent font-bold' 
                                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            }`}
                          >
                            <Check size={10} />
                            <span>{badge}</span>
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  {/* footer pricing & cta */}
                  <div className="pt-4 border-t border-white/5 flex flex-col gap-2 mt-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-white/40 block">BEST PRICE</span>
                        <span className="text-lg font-bold text-accent font-display glow-accent">
                          {product.price_formatted}
                        </span>
                      </div>

                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-secondary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.03] transition-all duration-200"
                      >
                        <span>{product.is_pasted_link ? 'Direct Link' : 'View Deal'}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>

                    {product.is_pasted_link && product.search_url && (
                      <a
                        href={product.search_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center py-1.5 bg-white/5 border border-white/10 hover:border-accent/40 rounded-xl text-[10px] font-semibold text-white/70 hover:text-white transition duration-200 font-display"
                      >
                        Find {sessionRequirements.size || 'Requested Size'} on {product.site_name}
                      </a>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-3xl p-12 text-center max-w-xl mx-auto border border-white/5 space-y-6"
          >
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-secondary/10 border border-secondary/30 text-secondary">
                <HelpCircle size={48} className="animate-bounce" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-display text-white">No exact matches found</h2>
              <p className="text-sm text-white/50 max-w-md mx-auto">
                All crawled sites failed to confirm one or more of your strict requirements (like size availability, color, or budget).
              </p>
            </div>

            <button
              onClick={handleRefine}
              className="px-6 py-3 bg-primary hover:bg-accent text-white font-bold rounded-xl transition duration-200"
            >
              Relax a Requirement
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
