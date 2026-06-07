import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { detectProductCategory, getNextChatStep, fetchMatchingProducts, getEstimatedProductPrice } from '../lib/gemini'

export const useStore = create((set, get) => ({
  // Authentication & Profile
  user: null,
  profile: null,
  loadingUser: true,
  preferredSizes: JSON.parse(localStorage.getItem('shopsync_sizes')) || {},

  // Settings
  geminiKey: localStorage.getItem('shopsync_gemini_api_key') || '',

  // Active Search Session
  sessionProduct: '',
  sessionCategory: '',
  sessionRequirements: {},
  sessionOriginalLink: '',
  chatMessages: [],
  isSearching: false,
  isGeneratingResults: false,
  searchResults: [],
  searchComplete: false,
  searchQuery: '',
  currentSessionId: null,

  // Saved History & Products
  searchHistory: JSON.parse(localStorage.getItem('shopsync_history')) || [],
  savedProducts: JSON.parse(localStorage.getItem('shopsync_saved')) || [],

  // Results Sorting
  sortOrder: 'price-asc', // 'price-asc' | 'price-desc'

  // Actions
  setGeminiKey: (key) => {
    localStorage.setItem('shopsync_gemini_api_key', key)
    set({ geminiKey: key })
  },

  // Initialize and check user session
  checkUser: async () => {
    set({ loadingUser: true })
    if (!supabase) {
      set({ user: null, profile: null, loadingUser: false })
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        set({ user: session.user })
        
        // Fetch or create profile
        let { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .single()

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              preferred_sizes: get().preferredSizes
            })
            .select()
            .single()

          if (!createError) profile = newProfile
        }

        if (profile) {
          set({ 
            profile, 
            preferredSizes: profile.preferred_sizes || {}
          })
          localStorage.setItem('shopsync_sizes', JSON.stringify(profile.preferred_sizes || {}))
        }
      } else {
        set({ user: null, profile: null })
      }
    } catch (e) {
      console.error("Auth check failed:", e)
    } finally {
      set({ loadingUser: false })
    }
  },

  loginWithGoogle: async () => {
    if (!supabase) {
      alert("Supabase is not configured yet! Running in offline/guest mode.")
      return
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
  },

  logout: async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    set({ user: null, profile: null })
  },

  updatePreferredSizes: async (sizes) => {
    set({ preferredSizes: sizes })
    localStorage.setItem('shopsync_sizes', JSON.stringify(sizes))

    const { user } = get()
    if (user && supabase) {
      await supabase
        .from('user_profiles')
        .update({ preferred_sizes: sizes })
        .eq('id', user.id)
    }
  },

  // Start a new search from Home page
  startSearchSession: async (queryOrLink) => {
    const isLink = queryOrLink.toLowerCase().startsWith('http://') || queryOrLink.toLowerCase().startsWith('https://')
    set({
      sessionOriginalLink: isLink ? queryOrLink : '',
      sessionProduct: 'Detecting...',
      sessionCategory: '',
      sessionRequirements: {},
      chatMessages: [
        { sender: 'assistant', text: 'Analyzing your request... Finding product details.', timestamp: new Date() }
      ],
      isSearching: true,
      searchResults: [],
      searchComplete: false,
      searchQuery: '',
      currentSessionId: null
    })

    try {
      const result = await detectProductCategory(queryOrLink)
      const detectedCategory = result.category
      const detectedName = result.product_name

      // Check if user has pre-configured size for this category to pre-populate requirements
      const preConfiguredSizes = get().preferredSizes
      const initialRequirements = {}
      if (preConfiguredSizes[detectedCategory]) {
        initialRequirements.size = preConfiguredSizes[detectedCategory]
      }

      set({
        sessionProduct: detectedName,
        sessionCategory: detectedCategory,
        sessionRequirements: initialRequirements
      })

      // Get first question from Gemini
      const chatStep = await getNextChatStep(
        detectedName,
        detectedCategory,
        [],
        initialRequirements
      )

      const greetingMessage = `Hi! I found that you are searching for the **${detectedName}** (${detectedCategory} category). `
      const questionText = chatStep.next_question || "Let's gather some details. What are your specific requirements?"

      set({
        chatMessages: [
          { sender: 'assistant', text: greetingMessage + questionText, timestamp: new Date() },
        ],
        isSearching: false
      })

      // Create session in Supabase if logged in
      const { user } = get()
      if (user && supabase) {
        const { data, error } = await supabase
          .from('search_sessions')
          .insert({
            user_id: user.id,
            product_query: queryOrLink,
            requirements: initialRequirements,
            results: []
          })
          .select()
          .single()
        
        if (!error && data) {
          set({ currentSessionId: data.id })
        }
      }
    } catch (e) {
      console.error("Start search session failed:", e)
      set({
        chatMessages: [
          { sender: 'assistant', text: "Sorry, I couldn't analyze the product. Let's try again or use another name.", timestamp: new Date() }
        ],
        isSearching: false
      })
    }
  },

  // User sends a reply in the chat
  sendChatMessage: async (text) => {
    const { chatMessages, sessionProduct, sessionCategory, sessionRequirements, currentSessionId, user } = get()
    
    const newMessages = [
      ...chatMessages,
      { sender: 'user', text, timestamp: new Date() }
    ]

    set({ 
      chatMessages: newMessages,
      isSearching: true 
    })

    try {
      const chatStep = await getNextChatStep(
        sessionProduct,
        sessionCategory,
        newMessages,
        sessionRequirements
      )

      const updatedRequirements = chatStep.requirements || {}

      set({
        sessionRequirements: updatedRequirements
      })

      if (chatStep.is_complete) {
        // Requirements gather complete, proceed to search
        set({ 
          isSearching: false,
          isGeneratingResults: true 
        })
        
        let estPrice = 3000
        try {
          estPrice = await getEstimatedProductPrice(sessionProduct)
        } catch (e) {}

        const finalRequirements = {
          ...updatedRequirements,
          estimated_price: estPrice
        }

        set({
          sessionRequirements: finalRequirements
        })

        const finalResults = await fetchMatchingProducts(
          sessionProduct,
          sessionCategory,
          finalRequirements,
          chatStep.search_query,
          get().sessionOriginalLink
        )

        set({
          searchResults: finalResults,
          isGeneratingResults: false,
          searchComplete: true,
          searchQuery: chatStep.search_query
        })

        // Update session in Supabase if exists
        if (currentSessionId && supabase) {
          await supabase
            .from('search_sessions')
            .update({
              requirements: updatedRequirements,
              results: finalResults
            })
            .eq('id', currentSessionId)
        }

        // Save search session to history locally/cloud
        const newHistoryItem = {
          id: currentSessionId || Math.random().toString(36).substring(7),
          product_name: sessionProduct,
          category: sessionCategory,
          requirements: updatedRequirements,
          results: finalResults,
          created_at: new Date().toISOString()
        }

        const updatedHistory = [newHistoryItem, ...get().searchHistory].slice(0, 30)
        set({ searchHistory: updatedHistory })
        localStorage.setItem('shopsync_history', JSON.stringify(updatedHistory))

      } else {
        // Not complete yet, append the next question
        set({
          chatMessages: [
            ...newMessages,
            { sender: 'assistant', text: chatStep.next_question, timestamp: new Date() }
          ],
          isSearching: false
        })

        // Update session in Supabase if exists
        if (currentSessionId && supabase) {
          await supabase
            .from('search_sessions')
            .update({ requirements: updatedRequirements })
            .eq('id', currentSessionId)
        }
      }
    } catch (e) {
      console.error("Chat turn failed:", e)
      set({
        chatMessages: [
          ...newMessages,
          { sender: 'assistant', text: "Hmm, I ran into an error processing that. Could you repeat or clarify?", timestamp: new Date() }
        ],
        isSearching: false
      })
    }
  },

  // Refine / return back to chat from results
  refineRequirements: () => {
    const { chatMessages } = get()
    set({
      searchComplete: false,
      chatMessages: [
        ...chatMessages,
        { sender: 'assistant', text: "Let's refine your requirements. What would you like to change? (e.g. change budget, size, or color)", timestamp: new Date() }
      ]
    })
  },

  // Sort search results
  setSortOrder: (order) => {
    set({ sortOrder: order })
  },

  // Save product deals
  saveProduct: async (product) => {
    const { user, savedProducts } = get()
    const isAlreadySaved = savedProducts.some(p => p.product_url === product.url)
    
    if (isAlreadySaved) return

    const newSavedItem = {
      id: Math.random().toString(36).substring(7),
      product_name: product.product_name,
      product_url: product.url,
      price: product.price_formatted,
      site_name: product.site_name,
      created_at: new Date().toISOString()
    }

    if (user && supabase) {
      try {
        const { data, error } = await supabase
          .from('saved_products')
          .insert({
            user_id: user.id,
            product_name: product.product_name,
            product_url: product.url,
            price: product.price_formatted,
            site_name: product.site_name
          })
          .select()
          .single()

        if (!error && data) {
          const updated = [data, ...savedProducts]
          set({ savedProducts: updated })
          localStorage.setItem('shopsync_saved', JSON.stringify(updated))
        }
      } catch (e) {
        console.error("Save product to Supabase failed:", e)
      }
    } else {
      const updated = [newSavedItem, ...savedProducts]
      set({ savedProducts: updated })
      localStorage.setItem('shopsync_saved', JSON.stringify(updated))
    }
  },

  removeSavedProduct: async (id) => {
    const { user, savedProducts } = get()
    const updated = savedProducts.filter(p => p.id !== id)
    set({ savedProducts: updated })
    localStorage.setItem('shopsync_saved', JSON.stringify(updated))

    if (user && supabase) {
      await supabase
        .from('saved_products')
        .delete()
        .eq('id', id)
    }
  },

  loadHistory: async () => {
    const { user } = get()
    if (!user || !supabase) return

    try {
      // Load history sessions
      const { data: sessions, error: sesError } = await supabase
        .from('search_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (!sesError && sessions) {
        const mappedSessions = sessions.map(s => ({
          id: s.id,
          product_name: s.product_query,
          category: s.requirements?.category || 'other',
          requirements: s.requirements || {},
          results: s.results || [],
          created_at: s.created_at
        }))
        set({ searchHistory: mappedSessions })
        localStorage.setItem('shopsync_history', JSON.stringify(mappedSessions))
      }

      // Load saved products
      const { data: saved, error: savedError } = await supabase
        .from('saved_products')
        .select('*')
        .order('created_at', { ascending: false })

      if (!savedError && saved) {
        set({ savedProducts: saved })
        localStorage.setItem('shopsync_saved', JSON.stringify(saved))
      }
    } catch (e) {
      console.error("Load history failed:", e)
    }
  }
}))
