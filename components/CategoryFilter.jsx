"use client"
import { useState } from "react"
import { Filter } from "lucide-react"
import { Switch } from "@/components/ui/switch" // add toggle support

const categories = [
  "All",
  "Gaming",
  "Music",
  "Education",
  "Entertainment",
  "Sports",
  "Technology",
  "Cooking",
  "Travel",
  "Fitness",
  "Art",
  "Science",
  "News",
  "Comedy",
  "Lifestyle",
]

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  className = "",
  useToggles = false,
  onToggleChange,
}) {
  const [showAll, setShowAll] = useState(false)
  const [selectedSet, setSelectedSet] = useState(new Set())

  const visibleCategories = showAll ? categories : categories.slice(0, 8)

  const handleToggle = (cat, checked) => {
    const next = new Set(selectedSet)
    if (checked) next.add(cat)
    else next.delete(cat)
    setSelectedSet(next)
    onToggleChange?.(Array.from(next))
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Categories</h3>
      </div>

      {useToggles ? (
        <div className="space-y-2">
          {visibleCategories.map((category) => (
            <label
              key={category}
              className="flex items-center justify-between rounded-lg border border-accent px-3 py-2"
            >
              <span className="text-sm">{category}</span>
              <Switch
                checked={selectedSet.has(category)}
                onCheckedChange={(checked) => handleToggle(category, checked)}
                aria-label={`Toggle ${category}`}
              />
            </label>
          ))}
          {categories.length > 8 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-2 w-full px-3 py-1.5 rounded-lg text-sm bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              {showAll ? "Show Less" : `+${categories.length - 8} More`}
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {visibleCategories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category === "All" ? null : category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category || (category === "All" && !selectedCategory)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {category}
            </button>
          ))}
          {categories.length > 8 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              {showAll ? "Show Less" : `+${categories.length - 8} More`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
