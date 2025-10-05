import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Video from "@/models/Video"
import { z } from "zod"

/**
 * GET /api/videos/user/[id]?page=&limit=
 * - Zod validation
 * - Pagination with skip/limit
 * - Projections + .lean()
 * - Simple in-memory rate limit per IP
 */

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

const limiter = global.__userVideosLimiter || new Map()
global.__userVideosLimiter = limiter

function rateLimit(ip, windowMs = 60_000, max = 60) {
  const now = Date.now()
  const entry = limiter.get(ip) || { count: 0, reset: now + windowMs }
  if (now > entry.reset) {
    entry.count = 0
    entry.reset = now + windowMs
  }
  entry.count += 1
  limiter.set(ip, entry)
  return entry.count <= max
}

export async function GET(req, { params }) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    await connectDB()
    const { id } = await params

    const url = new URL(req.url)
    const parsed = querySchema.safeParse({
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
    })
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 })
    }

    const { page, limit } = parsed.data
    const projection = "title thumbnailUrl views createdAt isPublic duration"
    const filter = { uploadedBy: id }

    const [videos, total] = await Promise.all([
      Video.find(filter)
        .select(projection)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Video.countDocuments(filter),
    ])

    return NextResponse.json({ data: videos, total, page, limit })
  } catch (e) {
    console.error("[user videos] error", e)
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}
