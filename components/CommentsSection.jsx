"use client"
import { useState, useCallback } from "react"
import { Heart, Reply, MoreVertical, Smile } from "lucide-react"
import apiClient from "@/lib/api-client"

const emojiReactions = ["👍", "👎", "❤️", "😂", "😮", "😢", "😡"]

export default function CommentsSection({ videoId, initialComments = [] }) {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [showEmojis, setShowEmojis] = useState(false)

  const deduplicateComments = useCallback((commentsArray) => {
    const seen = new Set()
    return commentsArray.filter((comment) => {
      const id = comment._id || comment.id
      if (seen.has(id)) {
        return false
      }
      seen.add(id)
      return true
    })
  }, [])

  const handleAddComment = useCallback(
    async (e) => {
      e.preventDefault()
      if (!newComment.trim()) return

      try {
        console.log("[v0] Adding comment to video:", videoId)

        const data = await apiClient.post(`/api/videos/${videoId}/comments`, { text: newComment }, { cache: false })

        if (data.comment) {
          setComments((prev) => [data.comment, ...prev])
          setNewComment("")

          // Clear comments cache
          apiClient.clearCache(`/api/videos/${videoId}/comments`)
        }
      } catch (error) {
        console.error("[v0] Error adding comment:", error)
        alert("Failed to add comment. Please try again.")
      }
    },
    [videoId, newComment],
  )

  const handleAddReply = useCallback(
    async (commentId) => {
      if (!replyText.trim()) return

      try {
        console.log("[v0] Adding reply to comment:", commentId)

        const data = await apiClient.post(
          `/api/videos/${videoId}/comments/${commentId}/replies`,
          { text: replyText },
          { cache: false },
        )

        if (data.reply) {
          setComments((prev) =>
            prev.map((comment) =>
              comment._id === commentId ? { ...comment, replies: [...(comment.replies || []), data.reply] } : comment,
            ),
          )
          setReplyText("")
          setReplyingTo(null)
        }
      } catch (error) {
        console.error("[v0] Error adding reply:", error)
        alert("Failed to add reply. Please try again.")
      }
    },
    [videoId, replyText],
  )

  const handleReaction = useCallback(
    async (commentId, emoji, isReply = false, replyId = null) => {
      try {
        const url = isReply
          ? `/api/videos/${videoId}/comments/${commentId}/replies/${replyId}/react`
          : `/api/videos/${videoId}/comments/${commentId}/react`

        console.log("[v0] Adding reaction:", emoji, "to", isReply ? "reply" : "comment")

        const data = await apiClient.post(url, { emoji }, { cache: false })

        if (data.reactions) {
          setComments((prev) =>
            prev.map((comment) => {
              if (comment._id === commentId) {
                if (isReply) {
                  return {
                    ...comment,
                    replies: (comment.replies || []).map((reply) =>
                      reply._id === replyId ? { ...reply, reactions: data.reactions } : reply,
                    ),
                  }
                } else {
                  return { ...comment, reactions: data.reactions }
                }
              }
              return comment
            }),
          )
        }
      } catch (error) {
        console.error("[v0] Error adding reaction:", error)
      }
    },
    [videoId],
  )

  const formatTimeAgo = useCallback((date) => {
    const now = new Date()
    const diff = now - new Date(date)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }, [])

  const toggleEmojis = useCallback(() => {
    setShowEmojis((prev) => !prev)
  }, [])

  const addEmoji = useCallback((emoji) => {
    setNewComment((prev) => prev + emoji)
    setShowEmojis(false)
  }, [])

  const startReply = useCallback(
    (commentId) => {
      setReplyingTo(replyingTo === commentId ? null : commentId)
    },
    [replyingTo],
  )

  const submitReply = useCallback(
    (e, commentId) => {
      e.preventDefault()
      handleAddReply(commentId)
    },
    [handleAddReply],
  )

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-6">Comments ({comments.length})</h3>

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="mb-6">
        <div className="flex space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
            U
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center space-x-2">
                <button type="button" onClick={toggleEmojis} className="p-1 hover:bg-muted rounded">
                  <Smile className="h-4 w-4" />
                </button>
                {showEmojis && (
                  <div className="flex space-x-1 bg-card border border-border rounded-lg p-2">
                    {emojiReactions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => addEmoji(emoji)}
                        className="text-lg hover:scale-110 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment, index) => (
          <div key={comment._id || `comment-${index}`} className="flex space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {comment.user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{comment.user?.username || "Anonymous"}</span>
                    <span className="text-sm text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                  </div>
                  <button className="p-1 hover:bg-muted rounded">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-foreground mb-3">{comment.text}</p>

                {/* Comment Actions */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleReaction(comment._id, "👍")}
                    className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Heart className="h-4 w-4" />
                    <span>{comment.likes?.length || 0}</span>
                  </button>
                  <button
                    onClick={() => startReply(comment._id)}
                    className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Reply className="h-4 w-4" />
                    <span>Reply</span>
                  </button>
                  <div className="flex space-x-1">
                    {emojiReactions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(comment._id, emoji)}
                        className="text-sm hover:scale-110 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reply Form */}
                {replyingTo === comment._id && (
                  <form onSubmit={(e) => submitReply(e, comment._id)} className="mt-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 p-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <button
                        type="submit"
                        disabled={!replyText.trim()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                      >
                        Reply
                      </button>
                    </div>
                  </form>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {comment.replies.map((reply, replyIndex) => (
                      <div key={reply._id || `reply-${replyIndex}`} className="flex space-x-3">
                        <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-semibold text-xs">
                          {reply.user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-sm">{reply.user?.username || "Anonymous"}</span>
                                <span className="text-xs text-muted-foreground">{formatTimeAgo(reply.createdAt)}</span>
                              </div>
                            </div>
                            <p className="text-sm text-foreground mb-2">{reply.text}</p>
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleReaction(comment._id, "👍", true, reply._id)}
                                className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground"
                              >
                                <Heart className="h-3 w-3" />
                                <span>{reply.likes?.length || 0}</span>
                              </button>
                              <div className="flex space-x-1">
                                {emojiReactions.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReaction(comment._id, emoji, true, reply._id)}
                                    className="text-xs hover:scale-110 transition-transform"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
