"use client"
import { useState, useEffect, useCallback, useMemo } from "react"

export default function Analytics({ userId, data }) {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")

  const fetchAnalytics = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      console.log("[v0] Fetching analytics for user:", userId, "timeRange:", timeRange)

      const response = await fetch(`/api/dashboard/analytics?userId=${userId}&timeRange=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Analytics data received:", data)
        setAnalytics(data)
      } else {
        console.error("[v0] Analytics API error:", response.status)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }, [userId, timeRange]) // Added proper dependencies

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const handleTimeRangeChange = useCallback((newTimeRange) => {
    console.log("[v0] Time range changed to:", newTimeRange)
    setTimeRange(newTimeRange)
  }, [])

  const timeRangeOptions = useMemo(
    () => [
      { value: "7d", label: "Last 7 days" },
      { value: "30d", label: "Last 30 days" },
      { value: "90d", label: "Last 90 days" },
      { value: "1y", label: "Last year" },
    ],
    [],
  )

  const metricCards = useMemo(
    () => [
      {
        title: "Total Views",
        value: analytics?.totalViews || 0,
        change: analytics?.viewsChange || 0,
        icon: "👁️",
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      },
      {
        title: "Watch Time",
        value: `${Math.round((analytics?.totalWatchTime || 0) / 60)}m`,
        change: analytics?.watchTimeChange || 0,
        icon: "⏱️",
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20",
      },
      {
        title: "Likes",
        value: analytics?.totalLikes || 0,
        change: analytics?.likesChange || 0,
        icon: "❤️",
        color: "text-red-600",
        bgColor: "bg-red-50 dark:bg-red-900/20",
      },
      {
        title: "Comments",
        value: analytics?.totalComments || 0,
        change: analytics?.commentsChange || 0,
        icon: "💬",
        color: "text-purple-600",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
      },
    ],
    [analytics],
  )

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => handleTimeRangeChange(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
        >
          {timeRangeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
            color={metric.color}
            bgColor={metric.bgColor}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Views Over Time</h3>
          <ViewsChart data={analytics?.viewsOverTime || []} />
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Performing Videos</h3>
          <TopVideosList videos={analytics?.topVideos || []} />
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Engagement Rate</h3>
          <EngagementChart data={analytics?.engagementData || []} />
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Audience Insights</h3>
          <AudienceInsights data={analytics?.audienceData || {}} />
        </div>
      </div>
    </div>
  )
}

const MetricCard = ({ title, value, change, icon, color, bgColor }) => {
  const isPositive = change >= 0

  return (
    <div className={`${bgColor} rounded-xl p-6 border border-border/50`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`text-2xl ${color}`}>{icon}</div>
        <div className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? "+" : ""}
          {change}%
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  )
}

const ViewsChart = ({ data }) => {
  const maxViews = useMemo(() => {
    if (!data || data.length === 0) return 0
    return Math.max(...data.map((d) => d.views))
  }, [data])

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">No data available</div>
  }

  return (
    <div className="h-64">
      <div className="flex items-end justify-between h-full space-x-1">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-primary rounded-t" style={{ height: `${(item.views / maxViews) * 200}px` }} />
            <div className="text-xs text-muted-foreground mt-2 text-center">
              {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const TopVideosList = ({ videos }) => {
  if (!videos || videos.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No videos available</div>
  }

  return (
    <div className="space-y-3">
      {videos.slice(0, 5).map((video, index) => (
        <div key={video._id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
          <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center text-sm font-bold">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{video.title || "Untitled Video"}</p>
            <p className="text-xs text-muted-foreground">
              {video.views || 0} views • {video.likes || 0} likes
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

const EngagementChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">No engagement data available</div>
    )
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground">{item.metric}</span>
            <span className="text-muted-foreground">{item.value}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(item.value, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

const AudienceInsights = ({ data }) => {
  const insights = useMemo(
    () => [
      { label: "Average Watch Time", value: `${Math.round(data.avgWatchTime || 0)}m` },
      { label: "Retention Rate", value: `${Math.round(data.retentionRate || 0)}%` },
      { label: "Engagement Rate", value: `${Math.round(data.engagementRate || 0)}%` },
      { label: "Subscriber Growth", value: `+${data.subscriberGrowth || 0}` },
    ],
    [data],
  )

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-foreground">{insight.label}</span>
          <span className="text-sm font-semibold text-primary">{insight.value}</span>
        </div>
      ))}
    </div>
  )
}
