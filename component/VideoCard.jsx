"use client"
import Link from "next/link"
import { useState, useRef } from "react"
import { Play, Eye, Clock, MoreVertical, Heart, Share2, Bookmark, TrendingUp } from "lucide-react"

export default function VideoCard({ video }) {
  const [isHovered, setIsHovered] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const videoRef = useRef(null)
  const hoverTimeoutRef = useRef(null)

  const handleMouseEnter = () => {
    setIsHovered(true)
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPreview(true)
      if (videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.play().catch(console.error)
      }
    }, 500)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setShowPreview(false)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views?.toString() || "0"
  }

  return (
    <div
      className="group relative glass-card rounded-2xl overflow-hidden hover:bg-white/5 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/videos/${video._id}`} className="block">
        <div className="relative aspect-video bg-muted/20 flex items-center justify-center overflow-hidden rounded-t-2xl">
          {showPreview && video.videoUrl ? (
            <video ref={videoRef} src={video.videoUrl} className="w-full h-full object-cover" muted loop playsInline />
          ) : (
            <img
              src={video.thumbnailUrl || "/placeholder.png"}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="glass rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                <Play className="h-8 w-8 text-white fill-white" />
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
              <button className="glass rounded-full p-2 hover:bg-white/20 transition-colors">
                <Bookmark className="h-4 w-4 text-white" />
              </button>
              <button className="glass rounded-full p-2 hover:bg-white/20 transition-colors">
                <Share2 className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {video.duration && (
            <div className="absolute bottom-3 right-3 glass rounded-lg px-2 py-1 text-white text-xs font-medium">
              {formatDuration(video.duration)}
            </div>
          )}

          {video.categories && video.categories.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
              {video.categories.slice(0, 2).map((category, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs px-3 py-1 rounded-full font-medium backdrop-blur-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Trending indicator */}
          {video.views > 10000 && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>Hot</span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300 text-lg leading-snug">
              {video.title}
            </h3>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-lg">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">
                {video.uploadedBy?.username?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {video.uploadedBy?.username || "Unknown Creator"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              {video.views && (
                <div className="flex items-center space-x-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="font-medium">{formatViews(video.views)} views</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1 text-green-400">
                <Heart className="h-4 w-4" />
                <span className="font-medium">{video.likes?.length || 0}</span>
              </div>
              <div className="flex items-center space-x-1 text-muted-foreground">
                <span>👎</span>
                <span>{video.dislikes?.length || 0}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{Math.floor(Math.random() * 100)}% match</div>
          </div>
        </div>
      </Link>
    </div>
  )
}
