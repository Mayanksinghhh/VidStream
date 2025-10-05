"use client"
import { useState, useEffect } from "react"
import { Trophy, Star, Play, Eye, Heart, Upload, Users, Clock, Award, Crown, Zap, Target } from "lucide-react"

const BADGE_DEFINITIONS = {
  // Upload Achievements
  first_upload: {
    id: "first_upload",
    name: "First Steps",
    description: "Uploaded your first video",
    icon: Upload,
    color: "text-green-400",
    bgColor: "bg-green-400/20",
    requirement: 1,
    type: "uploads",
  },
  video_creator: {
    id: "video_creator",
    name: "Content Creator",
    description: "Uploaded 5 videos",
    icon: Upload,
    color: "text-blue-400",
    bgColor: "bg-blue-400/20",
    requirement: 5,
    type: "uploads",
  },
  prolific_creator: {
    id: "prolific_creator",
    name: "Prolific Creator",
    description: "Uploaded 25 videos",
    icon: Crown,
    color: "text-purple-400",
    bgColor: "bg-purple-400/20",
    requirement: 25,
    type: "uploads",
  },

  // View Achievements
  first_view: {
    id: "first_view",
    name: "Getting Noticed",
    description: "Received your first view",
    icon: Eye,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/20",
    requirement: 1,
    type: "views",
  },
  popular_video: {
    id: "popular_video",
    name: "Popular Creator",
    description: "Reached 1,000 total views",
    icon: Eye,
    color: "text-orange-400",
    bgColor: "bg-orange-400/20",
    requirement: 1000,
    type: "views",
  },
  viral_creator: {
    id: "viral_creator",
    name: "Viral Sensation",
    description: "Reached 10,000 total views",
    icon: Zap,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/20",
    requirement: 10000,
    type: "views",
  },

  // Subscriber Achievements
  first_subscriber: {
    id: "first_subscriber",
    name: "First Fan",
    description: "Got your first subscriber",
    icon: Users,
    color: "text-pink-400",
    bgColor: "bg-pink-400/20",
    requirement: 1,
    type: "subscribers",
  },
  growing_channel: {
    id: "growing_channel",
    name: "Growing Channel",
    description: "Reached 50 subscribers",
    icon: Users,
    color: "text-indigo-400",
    bgColor: "bg-indigo-400/20",
    requirement: 50,
    type: "subscribers",
  },
  influencer: {
    id: "influencer",
    name: "Influencer",
    description: "Reached 500 subscribers",
    icon: Crown,
    color: "text-red-400",
    bgColor: "bg-red-400/20",
    requirement: 500,
    type: "subscribers",
  },

  // Engagement Achievements
  first_like: {
    id: "first_like",
    name: "Liked",
    description: "Received your first like",
    icon: Heart,
    color: "text-red-400",
    bgColor: "bg-red-400/20",
    requirement: 1,
    type: "likes",
  },
  loved_creator: {
    id: "loved_creator",
    name: "Loved Creator",
    description: "Received 100 total likes",
    icon: Heart,
    color: "text-pink-400",
    bgColor: "bg-pink-400/20",
    requirement: 100,
    type: "likes",
  },

  // Watch Time Achievements
  binge_watcher: {
    id: "binge_watcher",
    name: "Binge Watcher",
    description: "Watched 100 minutes of content",
    icon: Clock,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/20",
    requirement: 6000, // 100 minutes in seconds
    type: "watchTime",
  },
  dedicated_viewer: {
    id: "dedicated_viewer",
    name: "Dedicated Viewer",
    description: "Watched 10 hours of content",
    icon: Play,
    color: "text-blue-400",
    bgColor: "bg-blue-400/20",
    requirement: 36000, // 10 hours in seconds
    type: "watchTime",
  },

  // Special Achievements
  early_adopter: {
    id: "early_adopter",
    name: "Early Adopter",
    description: "One of the first 100 users",
    icon: Star,
    color: "text-gold-400",
    bgColor: "bg-yellow-400/20",
    requirement: 100,
    type: "special",
  },
  verified_creator: {
    id: "verified_creator",
    name: "Verified Creator",
    description: "Verified account status",
    icon: Award,
    color: "text-blue-500",
    bgColor: "bg-blue-500/20",
    requirement: 1,
    type: "special",
  },
}

export default function UserBadges({ userId, userStats = {}, earnedBadges = [], showAll = false, compact = false }) {
  const [badges, setBadges] = useState([])
  const [newlyEarned, setNewlyEarned] = useState([])

  useEffect(() => {
    calculateBadges()
  }, [userStats, earnedBadges])

  const calculateBadges = () => {
    const calculatedBadges = Object.values(BADGE_DEFINITIONS).map((badge) => {
      const isEarned = checkBadgeRequirement(badge, userStats)
      const wasEarned = earnedBadges.includes(badge.id)

      // Check for newly earned badges
      if (isEarned && !wasEarned) {
        setNewlyEarned((prev) => [...prev, badge.id])
        // Auto-remove from newly earned after 5 seconds
        setTimeout(() => {
          setNewlyEarned((prev) => prev.filter((id) => id !== badge.id))
        }, 5000)
      }

      return {
        ...badge,
        earned: isEarned,
        progress: calculateProgress(badge, userStats),
        isNew: newlyEarned.includes(badge.id),
      }
    })

    setBadges(calculatedBadges)
  }

  const checkBadgeRequirement = (badge, stats) => {
    switch (badge.type) {
      case "uploads":
        return (stats.totalVideos || 0) >= badge.requirement
      case "views":
        return (stats.totalViews || 0) >= badge.requirement
      case "subscribers":
        return (stats.totalSubscribers || 0) >= badge.requirement
      case "likes":
        return (stats.totalLikes || 0) >= badge.requirement
      case "watchTime":
        return (stats.totalWatchTime || 0) >= badge.requirement
      case "special":
        return earnedBadges.includes(badge.id)
      default:
        return false
    }
  }

  const calculateProgress = (badge, stats) => {
    let current = 0
    switch (badge.type) {
      case "uploads":
        current = stats.totalVideos || 0
        break
      case "views":
        current = stats.totalViews || 0
        break
      case "subscribers":
        current = stats.totalSubscribers || 0
        break
      case "likes":
        current = stats.totalLikes || 0
        break
      case "watchTime":
        current = stats.totalWatchTime || 0
        break
      default:
        return 100
    }
    return Math.min(100, (current / badge.requirement) * 100)
  }

  const formatRequirement = (badge) => {
    switch (badge.type) {
      case "watchTime":
        const hours = Math.floor(badge.requirement / 3600)
        const minutes = Math.floor((badge.requirement % 3600) / 60)
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
      default:
        return badge.requirement.toLocaleString()
    }
  }

  const earnedBadgesList = badges.filter((badge) => badge.earned)
  const unearnedBadges = badges.filter((badge) => !badge.earned)
  const displayBadges = showAll ? badges : earnedBadgesList

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {earnedBadgesList.slice(0, 5).map((badge) => {
          const IconComponent = badge.icon
          return (
            <div
              key={badge.id}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full ${badge.bgColor} ${badge.color} text-xs font-medium`}
              title={badge.description}
            >
              <IconComponent className="h-3 w-3" />
              <span>{badge.name}</span>
            </div>
          )
        })}
        {earnedBadgesList.length > 5 && (
          <div className="flex items-center px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
            +{earnedBadgesList.length - 5} more
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Newly Earned Badge Notification */}
      {newlyEarned.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {newlyEarned.map((badgeId) => {
            const badge = BADGE_DEFINITIONS[badgeId]
            const IconComponent = badge.icon
            return (
              <div
                key={badgeId}
                className="bg-card border border-border rounded-lg p-4 shadow-lg animate-in slide-in-from-right-5 duration-500"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${badge.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${badge.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold">Badge Earned!</p>
                    <p className="text-sm text-muted-foreground">{badge.name}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Earned Badges */}
      {earnedBadgesList.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4 flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Earned Badges ({earnedBadgesList.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedBadgesList.map((badge) => {
              const IconComponent = badge.icon
              return (
                <div
                  key={badge.id}
                  className={`relative p-4 rounded-lg border-2 ${badge.bgColor} border-current ${badge.color} transition-all duration-200 hover:scale-105`}
                >
                  {badge.isNew && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                      NEW!
                    </div>
                  )}
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-full ${badge.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${badge.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{badge.name}</h4>
                      <p className="text-sm opacity-80">{badge.description}</p>
                    </div>
                  </div>
                  <div className="text-xs opacity-60">Requirement: {formatRequirement(badge)}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Progress Towards Next Badges */}
      {showAll && unearnedBadges.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4 flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-500" />
            <span>Progress Towards Badges</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unearnedBadges.map((badge) => {
              const IconComponent = badge.icon
              return (
                <div
                  key={badge.id}
                  className="p-4 rounded-lg border border-border bg-card/50 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 rounded-full bg-muted">
                      <IconComponent className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-muted-foreground">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground/80">{badge.description}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{badge.progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${badge.color.replace("text-", "bg-")}`}
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">Requirement: {formatRequirement(badge)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Badge Statistics */}
      <div className="bg-card/50 rounded-lg p-4 border border-border">
        <h4 className="font-semibold mb-3">Badge Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-500">{earnedBadgesList.length}</div>
            <div className="text-sm text-muted-foreground">Earned</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-500">{Object.keys(BADGE_DEFINITIONS).length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">
              {((earnedBadgesList.length / Object.keys(BADGE_DEFINITIONS).length) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground">Completion</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-500">{newlyEarned.length}</div>
            <div className="text-sm text-muted-foreground">Recent</div>
          </div>
        </div>
      </div>
    </div>
  )
}
