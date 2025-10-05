"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import apiClient from "@/lib/api-client"

export default function RecommendationEngine({
  currentVideoId,
  currentCategories = [],
  userId = null,
  title = "Recommended Videos",
}) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching recommendations for video:", currentVideoId)

      const params = {
        limit: "6",
        exclude: currentVideoId,
      }

      if (currentCategories.length > 0) {
        params.categories = currentCategories.join(",")
      }

      if (userId) {
        params.userId = userId
      }

      const data = await apiClient.get("/api/videos/recommendations", params, {
        cacheTTL: 10 * 60 * 1000, // Cache recommendations for 10 minutes
      })

      setRecommendations(data.videos || [])
    } catch (error) {
      console.error("[v0] Error fetching recommendations:", error)
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }, [currentVideoId, currentCategories, userId])

  useEffect(() => {
    if (currentVideoId) {
      fetchRecommendations()
    }
  }, [fetchRecommendations, currentVideoId])

  const loadingSkeleton = useMemo(
    () => (
      <div className="space-y-4">
        <h3 className="font-semibold">{title}</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-3 animate-pulse">
              <div className="w-32 h-20 bg-muted rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    [title],
  )

  if (loading) {
    return loadingSkeleton
  }

  if (recommendations.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">No recommendations available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="space-y-3">
        {recommendations.map((video) => (
          <Link
            key={video._id}
            href={`/videos/${video._id}`}
            className="flex space-x-3 group hover:bg-accent/50 rounded-md p-2 transition-colors"
            aria-label={`Open video: ${video.title}`}
          >
            <div className="w-32 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
              <img
                src={video.thumbnailUrl || "/placeholder.svg?height=80&width=128&query=recommended video thumbnail"}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2 mb-1 group-hover:underline">{video.title}</h4>
              <p className="text-xs text-muted-foreground mb-1">{video.uploadedBy?.username || "Unknown"}</p>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{video.views?.toLocaleString() || 0} views</span>
                <span>•</span>
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
