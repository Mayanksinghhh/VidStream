import { NextResponse } from "next/server"
import { verifyTokenFromHeader } from "@/lib/auth"
import Video from "@/models/Video"
import apiCache from "@/lib/api-cache" // add cache

export async function GET(request) {
  try {
    const user = verifyTokenFromHeader(request)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const timeRange = searchParams.get("timeRange") || "30d"

    if (userId !== user._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const cacheKey = `analytics:${userId}:${timeRange}`
    const cached = apiCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Calculate date range
    const now = new Date()
    let startDate
    switch (timeRange) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get analytics data
    const [totalViews, totalLikes, totalComments, totalWatchTime, viewsOverTime, topVideos] = await Promise.all([
      Video.aggregate([
        { $match: { uploadedBy: user._id, createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]),
      Video.aggregate([
        { $match: { uploadedBy: user._id, createdAt: { $gte: startDate } } },
        { $project: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
        { $group: { _id: null, total: { $sum: "$likesCount" } } },
      ]),
      Video.aggregate([
        { $match: { uploadedBy: user._id, createdAt: { $gte: startDate } } },
        { $project: { commentsCount: { $size: { $ifNull: ["$comments", []] } } } },
        { $group: { _id: null, total: { $sum: "$commentsCount" } } },
      ]),
      Video.aggregate([
        { $match: { uploadedBy: user._id, createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: "$duration" } } },
      ]),
      Video.aggregate([
        { $match: { uploadedBy: user._id, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            views: { $sum: "$views" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Video.find({ uploadedBy: user._id }).sort({ views: -1 }).limit(5).select("title views likes createdAt"),
    ])

    // Calculate engagement data
    const engagementData = [
      {
        metric: "Like Rate",
        value: Math.round(((totalLikes[0]?.total || 0) / Math.max(totalViews[0]?.total || 1, 1)) * 100),
      },
      {
        metric: "Comment Rate",
        value: Math.round(((totalComments[0]?.total || 0) / Math.max(totalViews[0]?.total || 1, 1)) * 100),
      },
      { metric: "Retention Rate", value: 75 }, // Mock data
      { metric: "Click-through Rate", value: 12 }, // Mock data
    ]

    // Mock audience data
    const audienceData = {
      avgWatchTime: Math.round((totalWatchTime[0]?.total || 0) / Math.max(totalViews[0]?.total || 1, 1)),
      retentionRate: 75,
      engagementRate: Math.round(((totalLikes[0]?.total || 0) / Math.max(totalViews[0]?.total || 1, 1)) * 100),
      subscriberGrowth: 12,
    }

    const response = {
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
      totalComments: totalComments[0]?.total || 0,
      totalWatchTime: totalWatchTime[0]?.total || 0,
      viewsOverTime: viewsOverTime.map((item) => ({
        date: item._id,
        views: item.views,
      })),
      topVideos,
      engagementData,
      audienceData,
      viewsChange: 12,
      watchTimeChange: 8,
      likesChange: 15,
      commentsChange: 5,
    }

    apiCache.set(cacheKey, response, 5 * 60 * 1000)
    return NextResponse.json(response)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
