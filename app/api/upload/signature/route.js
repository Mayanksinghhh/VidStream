import { NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary"

/**
 * Create a signed payload for direct client→Cloudinary uploads.
 * Returns: { timestamp, signature, apiKey, cloudName, folder, eager }
 */
export async function GET() {
  try {
    const timestamp = Math.floor(Date.now() / 1000)
    const folder = "video_app"
    // eager transformations for ready-to-play assets (thumbnail + streaming)
    const eager = "c_fill,w_480,h_270/so_0/c_scale,w_1280" // concise eager string

    const paramsToSign = {
      timestamp,
      folder,
      eager,
      resource_type: "video",
    }

    // Use Cloudinary helper to sign request
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET)

    return NextResponse.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
      eager,
      resourceType: "video",
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    })
  } catch (e) {
    console.error("[signature] error", e)
    return NextResponse.json({ error: "Failed to create signature" }, { status: 500 })
  }
}
