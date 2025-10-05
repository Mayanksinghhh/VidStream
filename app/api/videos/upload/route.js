import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Video from "@/models/Video"
import { verifyTokenFromHeader } from "@/lib/auth"
import cloudinary from "@/lib/cloudinary"

export const config = { api: { bodyParser: false } }

export async function POST(req) {
  try {
    await connectDB()
    const user = verifyTokenFromHeader(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const contentType = req.headers.get("content-type") || ""
    const isForm = contentType.includes("multipart/form-data")
    const formData = isForm ? await req.formData() : null

    const title = (isForm ? formData.get("title") : null) || "Untitled"
    const description = (isForm ? formData.get("description") : null) || ""
    const categories =
      isForm && formData.get("categories")
        ? formData
            .get("categories")
            .split(",")
            .map((c) => c.trim())
        : []
    const tags =
      isForm && formData.get("tags")
        ? formData
            .get("tags")
            .split(",")
            .map((t) => t.trim())
        : []

    const publicId = isForm ? formData.get("publicId") || formData.get("public_id") : null
    const secureUrl = isForm ? formData.get("secure_url") || null : null
    const thumbUrl = isForm ? formData.get("thumbnail_url") || null : null
    const durationField = isForm ? formData.get("duration") || null : null

    let videoUrl,
      thumbnailUrl,
      cloudPublicId,
      duration = 0

    if (publicId && (secureUrl || thumbUrl)) {
      cloudPublicId = String(publicId)
      videoUrl = String(secureUrl || "")
      thumbnailUrl = String(thumbUrl || secureUrl || "")
      duration = durationField ? Math.round(Number(durationField)) : 0
    } else {
      // Original flow: upload stream server-side
      const file = formData?.get("file")
      if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

      const arrayBuffer = await file.arrayBuffer()
      const buf = Buffer.from(arrayBuffer)

      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "video_app",
            eager: [{ width: 480, height: 270, crop: "fill", quality: "auto" }, { streaming_profile: "hd" }],
          },
          (err, result) => {
            if (err) return reject(err)
            resolve(result)
          },
        )
        stream.end(buf)
      })

      cloudPublicId = uploaded.public_id
      videoUrl = uploaded.secure_url
      thumbnailUrl = uploaded.eager?.[0]?.secure_url || uploaded.secure_url
      duration = Math.round(uploaded.duration || 0)
    }

    const video = await Video.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      publicId: cloudPublicId,
      duration,
      categories,
      tags,
      uploadedBy: user.id,
    })

    return NextResponse.json({ video }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
