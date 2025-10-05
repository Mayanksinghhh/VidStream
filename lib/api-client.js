import apiCache from "./api-cache"

class APIClient {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_BASE_URL || ""
  }

  // Get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem("token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Generic fetch with caching
  async fetch(endpoint, options = {}) {
    const {
      method = "GET",
      cache = true,
      cacheTTL = 5 * 60 * 1000, // 5 minutes
      params = {},
      ...fetchOptions
    } = options

    const url = `${this.baseURL}${endpoint}`
    const cacheKey = apiCache.generateKey(url, { method, ...params })

    // Check cache for GET requests
    if (method === "GET" && cache) {
      const cachedData = apiCache.get(cacheKey)
      if (cachedData) {
        return cachedData
      }
    }

    try {
      // Build URL with params for GET requests
      let finalUrl = url
      if (method === "GET" && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams(params)
        finalUrl = `${url}?${searchParams}`
      }

      console.log("[v0] API request:", method, finalUrl)

      const response = await fetch(finalUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...fetchOptions.headers,
        },
        ...fetchOptions,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Cache successful GET responses
      if (method === "GET" && cache) {
        apiCache.set(cacheKey, data, cacheTTL)
      }

      return data
    } catch (error) {
      console.error("[v0] API error:", error)
      throw error
    }
  }

  // Convenience methods
  async get(endpoint, params = {}, options = {}) {
    return this.fetch(endpoint, { method: "GET", params, ...options })
  }

  async post(endpoint, data = {}, options = {}) {
    return this.fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      cache: false, // Don't cache POST requests
      ...options,
    })
  }

  async put(endpoint, data = {}, options = {}) {
    return this.fetch(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      cache: false,
      ...options,
    })
  }

  async delete(endpoint, options = {}) {
    return this.fetch(endpoint, {
      method: "DELETE",
      cache: false,
      ...options,
    })
  }

  // Clear cache for specific patterns
  clearCache(pattern) {
    const stats = apiCache.getStats()
    const keysToDelete = stats.keys.filter((key) => key.includes(pattern))

    keysToDelete.forEach((key) => {
      apiCache.delete(key)
    })

    console.log("[v0] Cleared cache for pattern:", pattern, "Keys:", keysToDelete.length)
  }

  // Clear all cache
  clearAllCache() {
    apiCache.clear()
  }
}

// Create singleton instance
const apiClient = new APIClient()

export default apiClient
