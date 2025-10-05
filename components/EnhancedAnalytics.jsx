"use client"
import { useState, useEffect } from "react"
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  Users,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
} from "lucide-react"

export default function EnhancedAnalytics({ userId, timeRange = "30d" }) {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState("views")

  useEffect(() => {
    fetchAnalytics()
  }, [userId, timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard/analytics?timeRange=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num?.toString() || "0"
  }

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const metrics = [
    {
      id: "views",
      name: "Total Views",
      value: analytics?.totalViews || 0,
      previous: analytics?.previousViews || 0,
      icon: Eye,
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
    },
    {
      id: "likes",
      name: "Total Likes",
      value: analytics?.totalLikes || 0,
      previous: analytics?.previousLikes || 0,
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-500/20",
    },
    {
      id: "comments",
      name: "Total Comments",
      value: analytics?.totalComments || 0,
      previous: analytics?.previousComments || 0,
      icon: MessageCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/20",
    },
    {
      id: "subscribers",
      name: "Subscribers",
      value: analytics?.totalSubscribers || 0,
      previous: analytics?.previousSubscribers || 0,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
    },
  ]

  const topVideos = analytics?.topVideos || []
  const recentActivity = analytics?.recentActivity || []
  const audienceData = analytics?.audienceData || {}
  const engagementRate = analytics?.engagementRate || 0
  const avgWatchTime = analytics?.avgWatchTime || 0

  return (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const IconComponent = metric.icon
          const growth = calculateGrowth(metric.value, metric.previous)
          const isPositive = growth >= 0

          return (
            <div
              key={metric.id}
              className={`bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-all duration-200 cursor-pointer ${
                selectedMetric === metric.id ? "ring-2 ring-purple-500/50" : ""
              }`}
              onClick={() => setSelectedMetric(metric.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${metric.color}`} />
                </div>
                <div
                  className={`flex items-center space-x-1 text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}
                >
                  {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{Math.abs(growth).toFixed(1)}%</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">{formatNumber(metric.value)}</h3>
                <p className="text-sm text-muted-foreground">{metric.name}</p>
                <p className="text-xs text-muted-foreground mt-1">vs {formatNumber(metric.previous)} last period</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Enhanced Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Engagement Rate */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-full bg-orange-500/20">
              <Activity className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold">Engagement Rate</h3>
              <p className="text-sm text-muted-foreground">Likes + Comments / Views</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-orange-500 mb-2">{engagementRate.toFixed(1)}%</div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, engagementRate * 2)}%` }}
            />
          </div>
        </div>

        {/* Average Watch Time */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-full bg-cyan-500/20">
              <Clock className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <h3 className="font-semibold">Avg Watch Time</h3>
              <p className="text-sm text-muted-foreground">Per video session</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-cyan-500 mb-2">{formatDuration(avgWatchTime)}</div>
          <p className="text-sm text-muted-foreground">{((avgWatchTime / 300) * 100).toFixed(0)}% of 5min average</p>
        </div>

        {/* Content Performance Score */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-full bg-yellow-500/20">
              <Target className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold">Performance Score</h3>
              <p className="text-sm text-muted-foreground">Overall content rating</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-yellow-500 mb-2">{analytics?.performanceScore || 85}/100</div>
          <div className="flex items-center space-x-2">
            <Award className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">Excellent</span>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Videos */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Top Performing Videos</span>
            </h3>
            <select className="text-sm border border-border rounded px-2 py-1 bg-background">
              <option value="views">By Views</option>
              <option value="likes">By Likes</option>
              <option value="engagement">By Engagement</option>
            </select>
          </div>
          <div className="space-y-4">
            {topVideos.slice(0, 5).map((video, index) => (
              <div key={video._id} className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-500">#{index + 1}</span>
                </div>
                <div className="flex-shrink-0">
                  <img
                    src={video.thumbnailUrl || "/placeholder.png"}
                    alt={video.title}
                    className="w-16 h-12 object-cover rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{video.title}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{formatNumber(video.views)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{formatNumber(video.likes?.length || 0)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{formatNumber(video.comments?.length || 0)}</span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-500">
                    {(((video.likes?.length || 0) / Math.max(video.views, 1)) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">engagement</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Insights */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>Audience Insights</span>
          </h3>
          <div className="space-y-6">
            {/* Top Categories */}
            <div>
              <h4 className="font-medium mb-3">Popular Categories</h4>
              <div className="space-y-2">
                {(audienceData.topCategories || []).map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <span className="text-sm">{category.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-muted rounded-full">
                        <div
                          className="h-2 bg-purple-500 rounded-full transition-all duration-300"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{category.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Activity Times */}
            <div>
              <h4 className="font-medium mb-3">Peak Activity Times</h4>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="text-muted-foreground mb-1">{day}</div>
                    <div className="h-8 bg-muted rounded flex items-end justify-center">
                      <div
                        className="w-full bg-blue-500 rounded transition-all duration-300"
                        style={{
                          height: `${(audienceData.weeklyActivity?.[index] || 0) * 100}%`,
                          minHeight: "2px",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Trends */}
            <div>
              <h4 className="font-medium mb-3">Growth Trends</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Subscriber Growth</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">+12.5%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">View Growth</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-500">+8.3%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Engagement Growth</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-500">+15.7%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Recent Activity</span>
        </h3>
        <div className="space-y-4">
          {recentActivity.slice(0, 10).map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div
                className={`p-2 rounded-full ${
                  activity.type === "like"
                    ? "bg-red-500/20"
                    : activity.type === "comment"
                      ? "bg-green-500/20"
                      : activity.type === "subscribe"
                        ? "bg-purple-500/20"
                        : "bg-blue-500/20"
                }`}
              >
                {activity.type === "like" && <Heart className="h-4 w-4 text-red-500" />}
                {activity.type === "comment" && <MessageCircle className="h-4 w-4 text-green-500" />}
                {activity.type === "subscribe" && <Users className="h-4 w-4 text-purple-500" />}
                {activity.type === "view" && <Eye className="h-4 w-4 text-blue-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
              </div>
              {activity.video && (
                <div className="flex-shrink-0">
                  <img
                    src={activity.video.thumbnailUrl || "/placeholder.png"}
                    alt={activity.video.title}
                    className="w-12 h-8 object-cover rounded"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
