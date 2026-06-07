import axios from 'axios'

// Helper to get the API Key (env variable first, then localStorage)
export const getGeminiApiKey = () => {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY
  if (envKey && envKey !== 'YOUR_GEMINI_API_KEY_HERE') return envKey
  return localStorage.getItem('shopsync_gemini_api_key') || ''
}

const callGemini = async (prompt, isJson = true, enableSearch = false) => {
  const apiKey = getGeminiApiKey()
  if (!apiKey) {
    throw new Error('Gemini API Key is not configured.')
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: isJson ? "application/json" : "text/plain"
    }
  }

  if (enableSearch) {
    payload.tools = [
      {
        google_search: {}
      }
    ]
  }

  const response = await axios.post(endpoint, payload)

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error('Empty response from Gemini API')
  }

  return isJson ? JSON.parse(text) : text
}

// -------------------------------------------------------------
// MOCK DATA FALLBACKS (For offline / no-API-key testing)
// -------------------------------------------------------------

const extractProductNameFromUrl = (url) => {
  try {
    const parsedUrl = new URL(url)
    const path = parsedUrl.pathname
    
    // Handle Amazon style links: /Product-Name-Here/dp/B0... or /dp/B0...
    if (path.includes('/dp/')) {
      const parts = path.split('/dp/')
      const namePart = parts[0].split('/').filter(Boolean).pop()
      if (namePart && namePart.length > 2 && !namePart.includes('ref=')) {
        return decodeURIComponent(namePart.replace(/[-_]/g, ' '))
      }
    }
    
    // General path segment extraction
    const segments = path.split('/').filter(Boolean)
    for (const segment of segments) {
      // Skip common static folders or codes
      if (segment.length > 3 && !segment.match(/^[a-z0-9]+$/i) && !['gp', 'dp', 'product', 'items', 'p'].includes(segment)) {
        return decodeURIComponent(segment.replace(/[-_]/g, ' '))
      }
    }
    
    // Fallback to domain name if nothing else
    return parsedUrl.hostname.replace('www.', '').split('.')[0] + " Product"
  } catch (e) {
    return ""
  }
}

const getMockCategory = (query) => {
  const isLink = query.toLowerCase().startsWith('http://') || query.toLowerCase().startsWith('https://')
  let extractedName = ""
  if (isLink) {
    extractedName = extractProductNameFromUrl(query)
  } else {
    extractedName = query.trim()
  }

  const q = query.toLowerCase()
  
  let category = 'other'
  if (q.includes('nike') || q.includes('adidas') || q.includes('jordan') || q.includes('shoe') || q.includes('sneaker') || q.includes('campus')) {
    category = 'shoes'
  } else if (q.includes('iphone') || q.includes('samsung') || q.includes('pixel') || q.includes('phone') || q.includes('oneplus')) {
    category = 'phone'
  } else if (q.includes('macbook') || q.includes('dell') || q.includes('hp') || q.includes('thinkpad') || q.includes('laptop') || q.includes('asus')) {
    category = 'laptop'
  } else if (q.includes('shirt') || q.includes('pant') || q.includes('hoodie') || q.includes('jacket') || q.includes('tshirt') || q.includes('clothing') || q.includes('cloth')) {
    category = 'clothing'
  } else if (q.includes('sony') || q.includes('bose') || q.includes('headphone') || q.includes('earbud') || q.includes('pods')) {
    category = 'headphones'
  }

  // Final fallback names if extraction failed
  if (!extractedName) {
    if (category === 'shoes') extractedName = 'Campus Mens Rage Running Shoes'
    else if (category === 'phone') extractedName = 'iPhone 16 Pro'
    else if (category === 'laptop') extractedName = 'MacBook Air M3'
    else if (category === 'clothing') extractedName = 'Premium Cotton Hoodie'
    else if (category === 'headphones') extractedName = 'Sony WH-1000XM5'
    else extractedName = 'Smart Product'
  }

  return { product_name: extractedName, category }
}

const getMockNextStep = (category, requirements, messageCount, userText) => {
  const req = { ...requirements }
  
  // Basic parsing of last user text to simulate AI extraction
  if (userText) {
    const text = userText.toLowerCase()
    
    // Parse size
    const sizeMatch = text.match(/(uk\s?\d+|us\s?\d+|eu\s?\d+|\d+)/i)
    if (sizeMatch && !req.size) req.size = sizeMatch[0].toUpperCase()

    // Parse storage
    const storageMatch = text.match(/(\d+gb|\d+\s?gb|\d+tb)/i)
    if (storageMatch && !req.storage) req.storage = storageMatch[0].toUpperCase()

    // Parse RAM
    const ramMatch = text.match(/(\d+gb ram|\d+gb)/i)
    if (ramMatch && !req.ram && category === 'laptop') req.ram = ramMatch[0].toUpperCase()

    // Parse color
    const colors = ['white', 'black', 'blue', 'red', 'green', 'grey', 'gray', 'silver', 'gold', 'pink']
    for (const c of colors) {
      if (text.includes(c) && !req.color) {
        req.color = c.charAt(0).toUpperCase() + c.slice(1)
      }
    }
    // Handle "all", "any", "open to all", or "no preference" color responses
    if (!req.color && (text.includes('all') || text.includes('any') || text.includes('open') || text.includes('no preference') || text.includes('no pref') || text.includes('none'))) {
      req.color = 'Any'
    }

    // Parse condition
    if (text.includes('new') && !req.condition) req.condition = 'New'
    if ((text.includes('refurbished') || text.includes('used') || text.includes('second')) && !req.condition) req.condition = 'Refurbished'

    // Parse brand for clothing
    if (category === 'clothing') {
      const brands = ['nike', 'adidas', 'zara', 'h&m', 'levis', 'levi\'s', 'puma', 'gucci', 'prada', 'uniqlo', 'gap', 'calvin klein', 'ck', 'tommy hilfiger']
      for (const b of brands) {
        if (text.includes(b) && !req.brand) {
          req.brand = b.charAt(0).toUpperCase() + b.slice(1)
        }
      }
      // Handle "all", "any", "open to all", or "no preference" brand responses for clothing
      if (!req.brand && (text.includes('all') || text.includes('any') || text.includes('open') || text.includes('no preference') || text.includes('no pref') || text.includes('none') || text.includes('any brand') || text.includes('no brand'))) {
        req.brand = 'Any'
      }
    }
    
    // Handle phone carrier unlocked
    if (category === 'phone' && !req.carrier && (text.includes('any') || text.includes('no requirement') || text.includes('none') || text.includes('unlocked') || text.includes('open'))) {
      req.carrier = 'Unlocked'
    }
  }

  // Determine next question
  let nextQuestion = null
  let isComplete = false

  if (category === 'shoes') {
    if (!req.size) nextQuestion = "What size are you looking for? (e.g., UK 9, US 10, EU 43)"
    else if (!req.color) nextQuestion = "Any color preference, or open to all?"
    else isComplete = true
  } 
  else if (category === 'clothing') {
    if (!req.size) nextQuestion = "What size do you need? (XS/S/M/L/XL or numeric size)"
    else if (!req.brand) nextQuestion = "Which brand are you looking for? (e.g. Nike, H&M, Zara, Levi's)"
    else isComplete = true
  } 
  else if (category === 'phone') {
    if (!req.storage) nextQuestion = "Which storage variant do you need? (128GB / 256GB / 512GB)"
    else if (!req.color) nextQuestion = "What is your color preference?"
    else if (!req.condition) nextQuestion = "Do you want a brand New device, or are you open to Refurbished?"
    else if (!req.carrier) nextQuestion = "Do you have any specific carrier requirement, or do you need it Unlocked?"
    else isComplete = true
  } 
  else if (category === 'laptop') {
    if (!req.ram) nextQuestion = "How much RAM do you need? (8GB / 16GB / 32GB)"
    else if (!req.processor) nextQuestion = "Preferred processor? (Intel i5/i7, AMD Ryzen, Apple M-series)"
    else if (!req.storage) nextQuestion = "What storage capacity do you need? (256GB / 512GB / 1TB)"
    else if (!req.screen_size) nextQuestion = "Preferred screen size? (e.g., 13-inch, 15-inch)"
    else isComplete = true
  } 
  else if (category === 'headphones') {
    if (!req.connection) nextQuestion = "Are you looking for Wired or Wireless/Bluetooth?"
    else if (!req.anc) nextQuestion = "Do you need Active Noise Cancellation (ANC)?"
    else if (!req.style) nextQuestion = "Preferred style: Over-ear, On-ear, or In-ear (earbuds)?"
    else isComplete = true
  } 
  else {
    if (!req.description) nextQuestion = "Can you describe what's most important to you about this product?"
    else if (!req.size) nextQuestion = "Are there any specific size, variant, or spec requirements?"
    else isComplete = true
  }

  // Safety trigger in case dialog is long
  if (messageCount > 8) {
    isComplete = true
    nextQuestion = null
  }

  return {
    next_question: isComplete ? null : nextQuestion,
    requirements: req,
    is_complete: isComplete,
    search_query: isComplete ? `${category} matching requirements` : ''
  }
}

const getMockResults = (productName, category, requirements, originalLink = '') => {
  const size = requirements.size || 'Standard'
  const color = requirements.color || 'Default'
  const brand = requirements.brand || 'Default Brand'
  const basePrice = requirements.estimated_price || 3000

  const mockSites = [
    { name: 'Amazon', domain: 'amazon.in', basePriceFactor: 1.0 },
    { name: 'Flipkart', domain: 'flipkart.com', basePriceFactor: 0.98 },
    { name: 'Croma', domain: 'croma.com', basePriceFactor: 1.02 },
    { name: 'Reliance Digital', domain: 'reliancedigital.in', basePriceFactor: 1.01 },
    { name: 'Tata CLiQ', domain: 'tatacliq.com', basePriceFactor: 0.99 },
    { name: 'Vijay Sales', domain: 'vijaysales.com', basePriceFactor: 1.03 },
    { name: 'Myntra', domain: 'myntra.com', basePriceFactor: 0.95 },
    { name: 'Nike India', domain: 'nike.com/in', basePriceFactor: 1.2 },
    { name: 'Campus Shoes', domain: 'campusshoes.com', basePriceFactor: 1.0 },
    { name: 'Adidas India', domain: 'adidas.co.in', basePriceFactor: 1.15 },
    { name: 'Puma India', domain: 'in.puma.com', basePriceFactor: 1.1 }
  ]

  // Filter sites based on category relevance and brand specific rules
  let activeSites = mockSites
  if (category === 'shoes') {
    const lowerProduct = productName.toLowerCase();
    const lowerBrand = brand.toLowerCase();
    const lowerLink = originalLink.toLowerCase();

    const isCampus = lowerProduct.includes('campus') || lowerBrand.includes('campus') || lowerLink.includes('campusshoes');
    const isNike = lowerProduct.includes('nike') || lowerBrand.includes('nike') || lowerLink.includes('nike');
    const isAdidas = lowerProduct.includes('adidas') || lowerBrand.includes('adidas') || lowerLink.includes('adidas');
    const isPuma = lowerProduct.includes('puma') || lowerBrand.includes('puma') || lowerLink.includes('puma');

    const allowed = ['Amazon', 'Flipkart', 'Myntra']
    if (isCampus) {
      allowed.push('Campus Shoes')
    } else if (isNike) {
      allowed.push('Nike India')
    } else if (isAdidas) {
      allowed.push('Adidas India')
    } else if (isPuma) {
      allowed.push('Puma India')
    }
    activeSites = mockSites.filter(s => allowed.includes(s.name))
  } else if (category === 'clothing') {
    activeSites = mockSites.filter(s => ['Amazon', 'Flipkart', 'Myntra'].includes(s.name))
  } else if (category === 'phone' || category === 'laptop' || category === 'headphones') {
    activeSites = mockSites.filter(s => ['Amazon', 'Flipkart', 'Croma', 'Reliance Digital', 'Vijay Sales'].includes(s.name))
  }

  const results = activeSites.map(site => {
    // Calculate price based on estimated price and site factor
    let calculatedPrice = Math.round(basePrice * site.basePriceFactor)
    if (calculatedPrice < 100) calculatedPrice = basePrice // sanity check

    const priceFormatted = `₹${calculatedPrice.toLocaleString('en-IN')}`
    
    // Build badges
    const matched_badges = []
    if (requirements.size) matched_badges.push(`Size: ${requirements.size}`)
    if (requirements.color) matched_badges.push(`Color: ${requirements.color}`)
    if (requirements.brand) matched_badges.push(`Brand: ${requirements.brand}`)
    if (requirements.storage) matched_badges.push(`Storage: ${requirements.storage}`)
    if (requirements.ram) matched_badges.push(`RAM: ${requirements.ram}`)
    if (requirements.processor) matched_badges.push(`CPU: ${requirements.processor}`)
    if (requirements.connection) matched_badges.push(`Type: ${requirements.connection}`)
    if (requirements.anc) matched_badges.push(`ANC: ${requirements.anc}`)

    // Build query terms without placeholder words like "Default", "Default Brand", "Standard", or "Any"
    const queryTerm = category === 'clothing' 
      ? `${(brand === 'Default Brand' || brand === 'Any') ? '' : brand} ${productName}`.trim() 
      : productName;

    const cleanColor = (color && color.toLowerCase() !== 'default' && color.toLowerCase() !== 'any' && color.toLowerCase() !== 'standard') ? color : '';
    const cleanSize = (size && size.toLowerCase() !== 'default' && size.toLowerCase() !== 'standard' && size.toLowerCase() !== 'any') ? size : '';
    
    const fullSearchText = [queryTerm, cleanColor, cleanSize].filter(Boolean).join(' ');
    const searchUrlParam = encodeURIComponent(fullSearchText);

    let siteSearchUrl = "";
    if (site.name === 'Amazon') {
      siteSearchUrl = `https://www.amazon.in/s?k=${searchUrlParam}`;
    } else if (site.name === 'Flipkart') {
      siteSearchUrl = `https://www.flipkart.com/search?q=${searchUrlParam}`;
    } else if (site.name === 'Myntra') {
      siteSearchUrl = `https://www.myntra.com/search?q=${searchUrlParam}`;
    } else if (site.name === 'Croma') {
      siteSearchUrl = `https://www.croma.com/search/?text=${searchUrlParam}`;
    } else if (site.name === 'Reliance Digital') {
      siteSearchUrl = `https://www.reliancedigital.in/search?q=${searchUrlParam}`;
    } else if (site.name === 'Tata CLiQ') {
      siteSearchUrl = `https://www.tatacliq.com/search/?searchCategory=all&text=${searchUrlParam}`;
    } else if (site.name === 'Vijay Sales') {
      siteSearchUrl = `https://www.vijaysales.com/search/${searchUrlParam}`;
    } else if (site.name === 'Nike India') {
      siteSearchUrl = `https://www.nike.com/in/w?q=${searchUrlParam}`;
    } else if (site.name === 'Campus Shoes') {
      siteSearchUrl = `https://www.campusshoes.com/search?q=${searchUrlParam}`;
    } else if (site.name === 'Adidas India') {
      siteSearchUrl = `https://www.adidas.co.in/search?q=${searchUrlParam}`;
    } else if (site.name === 'Puma India') {
      siteSearchUrl = `https://in.puma.com/in/en/search?q=${searchUrlParam}`;
    } else {
      siteSearchUrl = `https://www.${site.domain}/search?q=${searchUrlParam}`;
    }

    let url = "";
    let searchUrl = "";
    let isPastedLink = false;

    if (originalLink) {
      try {
        const parsedOrig = new URL(originalLink)
        // If the original pasted URL matches the domain of this shop, use it directly!
        if (parsedOrig.hostname.includes(site.domain)) {
          url = originalLink
          isPastedLink = true
          searchUrl = siteSearchUrl
        }
      } catch (e) {}
    }

    if (!url) {
      url = siteSearchUrl
    }

    if (isPastedLink) {
      matched_badges.push("Direct Page (Pasted)")
    } else {
      matched_badges.push("Search on Site")
    }

    return {
      site_name: site.name,
      site_logo: `https://www.google.com/s2/favicons?domain=${site.domain}&sz=128`,
      product_name: isPastedLink ? productName : `${productName} (${[cleanColor, cleanSize ? `Size ${cleanSize}` : ''].filter(Boolean).join(', ') || 'Details Matched'})`,
      price_formatted: priceFormatted,
      price_numeric: calculatedPrice,
      url: url,
      search_url: searchUrl,
      is_pasted_link: isPastedLink,
      matched_badges: matched_badges,
      is_exact_match: true
    }
  })

  // Sort by price (low to high)
  return results.sort((a, b) => a.price_numeric - b.price_numeric).slice(0, 8)
}

// -------------------------------------------------------------
// PUBLIC EXPORTS
// -------------------------------------------------------------

export const getEstimatedProductPrice = async (productName) => {
  const apiKey = getGeminiApiKey()
  if (!apiKey) return 3000 // default fallback

  const prompt = `
  You are a pricing assistant.
  Based on your knowledge, what is the typical real-world retail price of this product in India (in INR): "${productName}"?
  Provide ONLY a single estimated integer price value (e.g. 2999 or 45000). Do not write any other text.
  If you do not know, return 3000.
  `
  try {
    const text = await callGemini(prompt, false, false)
    const price = parseInt(text.replace(/[^0-9]/g, ''))
    return isNaN(price) ? 3000 : price
  } catch (e) {
    console.error("Failed to estimate product price:", e)
    return 3000
  }
}

export const detectProductCategory = async (query) => {
  const apiKey = getGeminiApiKey()
  if (!apiKey) {
    // Return mock
    return new Promise(resolve => setTimeout(() => resolve(getMockCategory(query)), 800))
  }

  const isLink = query.toLowerCase().startsWith('http://') || query.toLowerCase().startsWith('https://')

  if (isLink) {
    try {
      // Step 1: Perform search grounding to inspect/resolve the link details and determine the actual product name and category.
      const searchPrompt = `
      You are a shopping assistant. Perform a Google Search to analyze the contents of this product link: "${query}".
      Find the exact product name (e.g. Nike Air Force 1, iPhone 16 Pro) and its category.
      The category MUST be one of: shoes, clothing, phone, laptop, tablet, headphones, camera, appliance, furniture, book, toy, watch, bag, other.
      Output the name and category clearly in text.
      `
      const groundedText = await callGemini(searchPrompt, false, true)

      // Step 2: Parse the grounded details into JSON
      const structurePrompt = `
      Extract the product name and detected category from the text below.
      The category MUST be one of: shoes, clothing, phone, laptop, tablet, headphones, camera, appliance, furniture, book, toy, watch, bag, other.

      Text:
      """
      ${groundedText}
      """

      Output ONLY a JSON object in this exact format:
      {
        "product_name": "Extracted Product Name",
        "category": "detected-category"
      }
      `
      return await callGemini(structurePrompt, true, false)
    } catch (error) {
      console.error("Gemini detectProductCategory with link search failed, using basic category detect:", error)
    }
  }

  const prompt = `
  You are ShopSync AI category detector.
  Analyze this shopping query or link: "${query}"
  Extract the product name and detect the category.
  The category MUST be one of: shoes, clothing, phone, laptop, tablet, headphones, camera, appliance, furniture, book, toy, watch, bag, other.
  
  Output ONLY a JSON object in this exact format:
  {
    "product_name": "Extracted Product Name",
    "category": "detected-category"
  }
  `

  try {
    return await callGemini(prompt)
  } catch (error) {
    console.error("Gemini detectProductCategory failed, using mock:", error)
    return getMockCategory(query)
  }
}

export const getNextChatStep = async (productName, category, messages, requirements) => {
  const apiKey = getGeminiApiKey()
  
  // Format message logs
  const historyText = messages.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n')
  const lastUserText = messages[messages.length - 1]?.sender === 'user' ? messages[messages.length - 1].text : ''

  if (!apiKey) {
    // Return mock
    return new Promise(resolve => 
      setTimeout(() => 
        resolve(getMockNextStep(category, requirements, messages.length, lastUserText)), 
        800
      )
    )
  }

  const prompt = `
  You are ShopSync AI, a smart universal shopping assistant.
  Your job is to help users find products that exactly match their requirements.
  
  Product Name: ${productName}
  Category: ${category}
  Requirements gathered so far: ${JSON.stringify(requirements)}
  
  Dialog history:
  ${historyText}
  
  Goal requirements to gather:
  - For shoes: size, color. (Do NOT ask for budget or condition)
  - For clothing: size, brand. (Do NOT ask for budget, color, or material)
  - For phone: storage, color, condition (New/Refurbished), carrier/unlocked. (Do NOT ask for budget)
  - For laptop: ram, processor, storage, screen_size. (Do NOT ask for budget)
  - For headphones: connection (Wired/Wireless), anc (Yes/No), style (Over-ear/On-ear/In-ear). (Do NOT ask for budget)
  - For other: description, size. (Do NOT ask for budget)

  Rules:
  1. Ask exactly ONE question at a time. Be concise, friendly, and futuristic.
  2. Do NOT ask for the user's budget, max budget, or price preference under any circumstances!
  3. Parse the dialogue history to extract any newly provided requirements.
  4. If the user indicates they are open to any/all options or have no preference (e.g., 'all', 'any', 'open to all', 'no preference') for a requirement (like color or brand), set that requirement value to 'Any' and proceed.
  5. If all requirements for the category have been successfully gathered, set "is_complete" to true and "next_question" to null.
  6. Ensure you specify a "search_query" when complete (e.g. "Nike Air Force 1 white UK9 size").
  
  Output ONLY a JSON object in this exact format:
  {
    "next_question": "Your next single question here or null if complete",
    "requirements": { ...updated requirements object... },
    "is_complete": true/false,
    "search_query": "search query string or null"
  }
  `

  try {
    return await callGemini(prompt)
  } catch (error) {
    console.error("Gemini getNextChatStep failed, using mock:", error)
    return getMockNextStep(category, requirements, messages.length, lastUserText)
  }
}

export const fetchMatchingProducts = async (productName, category, requirements, searchQuery, originalLink = '') => {
  const apiKey = getGeminiApiKey()
  
  if (!apiKey) {
    // Return mock
    return new Promise(resolve => 
      setTimeout(() => 
        resolve(getMockResults(productName, category, requirements, originalLink)), 
        1500
      )
    )
  }

  try {
    // Step 1: Perform real Google Search using grounding to find actual product listings matching the details.
    const searchPrompt = `
    You are a professional shopping search helper. 
    Perform a Google search to find real, active shopping URLs for the product: "${productName}".
    Category: ${category}
    Requirements: ${JSON.stringify(requirements)}
    Search Query Term: ${searchQuery}

    Find up to 8 exact matching product links currently for sale from popular shopping sites (e.g. Amazon, eBay, Best Buy, Walmart, Nike, Myntra, Flipkart, Croma, etc.) that match the specific requirements (especially the correct size and color or brand requested).
    For each product match, you must list:
    1. The shopping site name (e.g. Amazon, Myntra)
    2. The exact product name displayed on the site
    3. The current price (e.g. in INR, USD)
    4. The direct, exact working URL/link to that product listing
    5. The badges/specs met by this listing (e.g. confirming the size and color)

    Do not generate mock links. Ensure that the links are the real URLs from the search results.
    Return your findings in a clear text format.
    `
    const groundedText = await callGemini(searchPrompt, false, true)
    
    // Step 2: Use Gemini JSON mode to structure the text search results into our exact JSON schema.
    const structurePrompt = `
    You are an expert data parser. Your task is to take the detailed search findings from the text below and parse them into a strict JSON object structure.
    
    Detailed Search Findings:
    """
    ${groundedText}
    """

    Parse this text and extract up to 8 real product matches.
    Ensure:
    1. The "url" field must contain the real, direct search link or listing URL found in the text.
    2. Crucially, the "url" field must be a fully formed, valid working link. If the link found in the text is truncated (contains "...") or is incomplete, you MUST NOT use it directly. Instead, construct a valid search URL for that domain with the product name and specifications (e.g. for Amazon: "https://www.amazon.in/s?k=...", for Flipkart: "https://www.flipkart.com/search?q=...", for Myntra: "https://www.myntra.com/search?q=...", etc.).
    3. The "price_numeric" field should be an integer representation of the price.
    4. The "site_logo" should be a favicon url like "https://www.google.com/s2/favicons?domain=domain-of-site&sz=128".
    
    Output ONLY a JSON object in this exact format, with no markdown code blocks outside of it:
    {
      "results": [
        {
          "site_name": "Site Name",
          "site_logo": "Favicon URL",
          "product_name": "Exact Product Name on Site",
          "price_formatted": "Price with currency symbol",
          "price_numeric": 12000,
          "url": "Direct Search Link",
          "matched_badges": ["Size: UK 9", "Color: White", "Exact Match"],
          "is_exact_match": true
        }
      ]
    }
    `
    const data = await callGemini(structurePrompt, true, false)
    return data.results || []
  } catch (error) {
    console.error("Gemini fetchMatchingProducts two-step search failed, using mock:", error)
    return getMockResults(productName, category, requirements, originalLink)
  }
}
