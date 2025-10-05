import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { verifyTokenFromHeader } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    await connectDB()
    const auth = verifyTokenFromHeader(request)
    const { id } = await params

    const channel = await User.findById(id).select("subscribers")
    if (!channel) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const isSubscribed = auth ? channel.subscribers?.some((u) => String(u) === String(auth.id)) : false

    return NextResponse.json({
      subscribers: channel.subscribers?.length || 0,
      isSubscribed,
    })
  } catch (err) {
    console.error("Subscribe GET error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    await connectDB()
    const auth = verifyTokenFromHeader(request)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    if (String(auth.id) === String(id)) {
      return NextResponse.json({ error: "Cannot subscribe to yourself" }, { status: 400 })
    }

    // addToSet both sides
    await User.updateOne({ _id: id }, { $addToSet: { subscribers: auth.id } })
    await User.updateOne({ _id: auth.id }, { $addToSet: { subscriptions: id } })

    const channel = await User.findById(id).select("subscribers")
    return NextResponse.json({
      message: "Subscribed successfully",
      subscribers: channel?.subscribers?.length || 0,
    })
  } catch (err) {
    console.error("Subscribe error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()
    const auth = verifyTokenFromHeader(request)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    // pull both sides
    await User.updateOne({ _id: id }, { $pull: { subscribers: auth.id } })
    await User.updateOne({ _id: auth.id }, { $pull: { subscriptions: id } })

    const channel = await User.findById(id).select("subscribers")
    return NextResponse.json({
      message: "Unsubscribed successfully",
      subscribers: channel?.subscribers?.length || 0,
    })
  } catch (err) {
    console.error("Unsubscribe error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
