class APICache {
  constructor() {
    this.cache = new Map()
    this.timestamps = new Map()
    this.defaultTTL = 5 * 60 * 1000 // 5 minutes default TTL
  }

  // Generate cache key from URL and params
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {})

    return `${url}?${JSON.stringify(sortedParams)}`
  }

  // Set cache with TTL
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, data)
    this.timestamps.set(key, Date.now() + ttl)
    console.log("[v0] Cache set for key:", key, "TTL:", ttl)
  }

  // Get from cache if not expired
  get(key) {
    const timestamp = this.timestamps.get(key)

    if (!timestamp || Date.now() > timestamp) {
      // Cache expired or doesn't exist
      this.cache.delete(key)
      this.timestamps.delete(key)
      console.log("[v0] Cache miss/expired for key:", key)
      return null
    }

    const data = this.cache.get(key)
    console.log("[v0] Cache hit for key:", key)
    return data
  }

  // Clear specific cache entry
  delete(key) {
    this.cache.delete(key)
    this.timestamps.delete(key)
    console.log("[v0] Cache cleared for key:", key)
  }

  // Clear all cache
  clear() {
    this.cache.clear()
    this.timestamps.clear()
    console.log("[v0] All cache cleared")
  }

  // Clear expired entries
  cleanup() {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now > timestamp) {
        this.cache.delete(key)
        this.timestamps.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log("[v0] Cleaned up", cleanedCount, "expired cache entries")
    }
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Create singleton instance
const apiCache = new APICache()

// Cleanup expired entries every 10 minutes
setInterval(
  () => {
    apiCache.cleanup()
  },
  10 * 60 * 1000,
)

export default apiCache
