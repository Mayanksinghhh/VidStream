"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import apiClient from "@/lib/api-client"

export default function LikeDislikeButtons({ videoId, initialLikes = [], initialDislikes = [] }) {
  const [likes, setLikes] = useState(initialLikes.length)
  const [dislikes, setDislikes] = useState(initialDislikes.length)
  const [userId, setUserId] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)

  const extractUserId = useCallback(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const id = payload.id || payload._id || null
        setUserId(id)

        // Check if user has already liked/disliked
        setIsLiked(initialLikes.includes(id))
        setIsDisliked(initialDislikes.includes(id))
      } catch (e) {
        console.error("[v0] Error parsing token:", e)
      }
    }
  }, [initialLikes, initialDislikes])

  useEffect(() => {
    extractUserId()
  }, [extractUserId])

  const handleAction = useCallback(
    async (type) => {
      if (!userId) {
        alert("Please log in first")
        return
      }

      try {
        console.log("[v0] Performing action:", type, "on video:", videoId)

        const data = await apiClient.post(
          `/api/videos/${videoId}/${type}`,
          { userId },
          {
            cache: false, // Don't cache like/dislike actions
          },
        )

        if (data.video) {
          const newLikes = (data.video.likes || []).length
          const newDislikes = (data.video.dislikes || []).length

          setLikes(newLikes)
          setDislikes(newDislikes)
          setIsLiked(data.video.likes?.includes(userId) || false)
          setIsDisliked(data.video.dislikes?.includes(userId) || false)

          // Clear video cache to ensure fresh data
          apiClient.clearCache(`/api/videos/${videoId}`)
        }
      } catch (error) {
        console.error("[v0] Action failed:", error)
        alert("Action failed. Please try again.")
      }
    },
    [userId, videoId],
  )

  const buttonStyles = useMemo(
    () => ({
      like: `px-3 py-1 border rounded transition-colors ${
        isLiked ? "bg-blue-100 border-blue-300 text-blue-700" : "hover:bg-gray-100"
      }`,
      dislike: `px-3 py-1 border rounded transition-colors ${
        isDisliked ? "bg-red-100 border-red-300 text-red-700" : "hover:bg-gray-100"
      }`,
    }),
    [isLiked, isDisliked],
  )

  return (
    <div className="flex items-center gap-3">
      <button onClick={() => handleAction("like")} className={buttonStyles.like} disabled={!userId}>
        👍 {likes}
      </button>
      <button onClick={() => handleAction("dislike")} className={buttonStyles.dislike} disabled={!userId}>
        👎 {dislikes}
      </button>
    </div>
  )
}
