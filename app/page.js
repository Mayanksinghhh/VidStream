"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import ThemeToggle from "@/components/ThemeToggle"
import CategoryFilter from "@/components/CategoryFilter"
import InfiniteScroll from "@/components/InfiniteScroll"
import { Search, Upload, LogIn, TrendingUp, Clock, Star, LogOut, Sparkles, Zap, Users, BarChart3 } from "lucide-react"

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function Home() {
  const { user, logout } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const fetchVideos = useCallback(async (pageNum = 1, category = null, query = "", sort = "newest") => {
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "12",
        sort: sort,
      })

      if (category) params.append("category", category)
      if (query) params.append("search", query)

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
      const res = await fetch(`${baseUrl}/api/videos?${params}`)

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      return data.videos || []
    } catch (error) {
      console.error("[v0] Error fetching videos:", error)
      return []
    }
  }, []) // No dependencies needed as it doesn't use external state

  const loadInitialVideos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("[v0] Loading initial videos with params:", { selectedCategory, debouncedSearchQuery, sortBy })
      const initialVideos = await fetchVideos(1, selectedCategory, debouncedSearchQuery, sortBy)
      setVideos(initialVideos)
      setPage(1)
      setHasMore(initialVideos.length === 12)
    } catch (err) {
      setError("Failed to load videos. Please try again.")
      console.error("[v0] Error loading videos:", err)
    } finally {
      setLoading(false)
    }
  }, [fetchVideos, selectedCategory, debouncedSearchQuery, sortBy])

  const loadMoreVideos = useCallback(
    async (currentPage) => {
      console.log("[v0] Loading more videos, current page:", currentPage)
      const newVideos = await fetchVideos(currentPage + 1, selectedCategory, debouncedSearchQuery, sortBy)
      setPage(currentPage + 1)
      setHasMore(newVideos.length === 12)
      return newVideos
    },
    [fetchVideos, selectedCategory, debouncedSearchQuery, sortBy],
  )

  const handleCategoryChange = useCallback((category) => {
    console.log("[v0] Category changed to:", category)
    setSelectedCategory(category)
  }, [])

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault()
      loadInitialVideos()
    },
    [loadInitialVideos],
  )

  const handleSortChange = useCallback((sort) => {
    console.log("[v0] Sort changed to:", sort)
    setSortBy(sort)
  }, [])

  useEffect(() => {
    loadInitialVideos()
  }, [loadInitialVideos])

  const sortOptions = useMemo(
    () => [
      { value: "newest", label: "Latest", icon: Clock },
      { value: "popular", label: "Trending", icon: TrendingUp },
      { value: "liked", label: "Top Rated", icon: Star },
    ],
    [],
  )

  const featureCards = useMemo(
    () => [
      {
        icon: Zap,
        title: "AI Recommendations",
        description: "Smart algorithms learn your preferences",
        delay: "0s",
      },
      {
        icon: Users,
        title: "Collaborative Playlists",
        description: "Create and share playlists with friends",
        delay: "0.2s",
      },
      {
        icon: BarChart3,
        title: "Advanced Analytics",
        description: "Deep insights for content creators",
        delay: "0.4s",
      },
    ],
    [],
  )

  return (
    <main className="min-h-screen main-page-bg text-foreground">
      <div className="max-w-7xl mx-auto">
        <header className="sticky top-0 z-50 glass border-b border-border/50 backdrop-blur-xl">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center animate-glow">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  VidStream
                </h1>
              </div>

              <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Discover amazing videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 w-80 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm placeholder:text-muted-foreground/70"
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center space-x-3">
              <ThemeToggle />
              {user ? (
                <>
                  <a
                    href="/upload"
                    className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-primary/25"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="font-medium">Create</span>
                  </a>
                  <a
                    href="/dashboard"
                    className="flex items-center space-x-2 px-4 py-2.5 glass rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Studio</span>
                  </a>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2.5 glass rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <a
                  href="/login"
                  className="flex items-center space-x-2 px-4 py-2.5 glass rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </a>
              )}
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="mb-12 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent leading-tight">
                Discover the future of
                <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  video streaming
                </span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Experience AI-powered recommendations, collaborative playlists, and immersive viewing like never before
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {featureCards.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={feature.title}
                      className="glass-card rounded-2xl p-6 hover:bg-white/5 transition-all duration-300 animate-float"
                      style={{ animationDelay: feature.delay }}
                    >
                      <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            className="mb-8"
          />

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground font-medium">Sort by:</span>
              <div className="flex items-center space-x-2">
                {sortOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                        sortBy === option.value
                          ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                          : "glass hover:bg-white/10"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Videos Grid with Infinite Scroll */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                <div
                  className="w-3 h-3 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="glass-card rounded-2xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Something went wrong</h3>
                <p className="text-muted-foreground mb-6">{error}</p>
                <button
                  onClick={loadInitialVideos}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 glass-card rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                  <Upload className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Ready to get started?</h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Be the first to share your creativity with our amazing community of viewers and creators.
                </p>
                <a
                  href="/upload"
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300 font-medium shadow-lg hover:shadow-primary/25"
                >
                  <Upload className="h-5 w-5" />
                  <span>Upload Your First Video</span>
                </a>
              </div>
            </div>
          ) : (
            <InfiniteScroll
              initialVideos={videos}
              fetchMoreVideos={loadMoreVideos}
              hasMore={hasMore}
              loading={loading}
            />
          )}
        </div>
      </div>
    </main>
  )
}
