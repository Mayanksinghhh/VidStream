"use client"
import { useState, useEffect } from "react"
import { Search, Filter, X, Calendar, Clock, Tag, User } from "lucide-react"

export default function AdvancedSearch({
  onSearch,
  initialFilters = {},
  categories = [],
  isVisible = false,
  onToggleVisibility,
}) {
  const [filters, setFilters] = useState({
    query: "",
    category: "",
    duration: "",
    uploadDate: "",
    sortBy: "relevance",
    sortOrder: "desc",
    minViews: "",
    maxViews: "",
    uploader: "",
    ...initialFilters,
  })

  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  useEffect(() => {
    // Count active filters
    const count = Object.entries(filters).filter(
      ([key, value]) => key !== "query" && key !== "sortBy" && key !== "sortOrder" && value !== "",
    ).length
    setActiveFiltersCount(count)
  }, [filters])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onSearch(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      query: filters.query, // Keep search query
      category: "",
      duration: "",
      uploadDate: "",
      sortBy: "relevance",
      sortOrder: "desc",
      minViews: "",
      maxViews: "",
      uploader: "",
    }
    setFilters(clearedFilters)
    onSearch(clearedFilters)
  }

  const durationOptions = [
    { value: "", label: "Any Duration" },
    { value: "short", label: "Under 4 minutes" },
    { value: "medium", label: "4-20 minutes" },
    { value: "long", label: "Over 20 minutes" },
  ]

  const uploadDateOptions = [
    { value: "", label: "Any Time" },
    { value: "hour", label: "Last Hour" },
    { value: "day", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
  ]

  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "date", label: "Upload Date" },
    { value: "views", label: "View Count" },
    { value: "likes", label: "Like Count" },
    { value: "duration", label: "Duration" },
    { value: "title", label: "Title (A-Z)" },
  ]

  return (
    <>
      {/* Search Toggle Button */}
      <button
        onClick={onToggleVisibility}
        className="relative p-2 hover:bg-muted rounded-lg transition-colors"
        title="Advanced Search"
      >
        <Filter className="h-5 w-5" />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Advanced Search Panel */}
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Advanced Search</span>
              </h2>
              <button onClick={onToggleVisibility} className="p-1 hover:bg-muted rounded transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Form */}
            <div className="p-6 space-y-6">
              {/* Search Query */}
              <div>
                <label className="block text-sm font-medium mb-2">Search Terms</label>
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => handleFilterChange("query", e.target.value)}
                  placeholder="Enter keywords..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center space-x-1">
                    <Tag className="h-4 w-4" />
                    <span>Category</span>
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Duration</span>
                  </label>
                  <select
                    value={filters.duration}
                    onChange={(e) => handleFilterChange("duration", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    {durationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload Date Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Upload Date</span>
                  </label>
                  <select
                    value={filters.uploadDate}
                    onChange={(e) => handleFilterChange("uploadDate", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    {uploadDateOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Uploader Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>Uploader</span>
                  </label>
                  <input
                    type="text"
                    value={filters.uploader}
                    onChange={(e) => handleFilterChange("uploader", e.target.value)}
                    placeholder="Username..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              {/* View Count Range */}
              <div>
                <label className="block text-sm font-medium mb-2">View Count Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={filters.minViews}
                    onChange={(e) => handleFilterChange("minViews", e.target.value)}
                    placeholder="Min views"
                    className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <input
                    type="number"
                    value={filters.maxViews}
                    onChange={(e) => handleFilterChange("maxViews", e.target.value)}
                    placeholder="Max views"
                    className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium mb-2">Sort Results</label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                    className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                    className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="desc">{filters.sortBy === "title" ? "Z-A" : "High to Low"}</option>
                    <option value="asc">{filters.sortBy === "title" ? "A-Z" : "Low to High"}</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Summary */}
              {activeFiltersCount > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Active Filters ({activeFiltersCount})</span>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, value]) => {
                      if (key === "query" || key === "sortBy" || key === "sortOrder" || !value) return null

                      let displayValue = value
                      if (key === "duration") {
                        displayValue = durationOptions.find((opt) => opt.value === value)?.label || value
                      } else if (key === "uploadDate") {
                        displayValue = uploadDateOptions.find((opt) => opt.value === value)?.label || value
                      }

                      return (
                        <span
                          key={key}
                          className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                        >
                          <span>
                            {key}: {displayValue}
                          </span>
                          <button onClick={() => handleFilterChange(key, "")} className="hover:text-purple-100">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
              <span className="text-sm text-muted-foreground">
                {activeFiltersCount > 0 ? `${activeFiltersCount} filters applied` : "No filters applied"}
              </span>
              <div className="flex space-x-3">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={onToggleVisibility}
                  className="px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 -z-10" onClick={onToggleVisibility} />
        </div>
      )}
    </>
  )
}
