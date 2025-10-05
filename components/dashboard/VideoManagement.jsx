"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function VideoManagement({ userId, onRefresh }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingVideo, setEditingVideo] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  const fetchUserVideos = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      console.log("[v0] Fetching user videos for userId:", userId)

      const response = await fetch(`/api/dashboard/videos?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] User videos received:", data.videos?.length || 0, "videos")
        setVideos(data.videos || [])
      } else {
        console.error("[v0] Failed to fetch user videos:", response.status)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch user videos:", error)
    } finally {
      setLoading(false)
    }
  }, [userId]) // Added userId as dependency

  useEffect(() => {
    fetchUserVideos()
  }, [fetchUserVideos])

  const handleDeleteVideo = useCallback(
    async (videoId) => {
      if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
        return
      }

      try {
        const token = localStorage.getItem("token")
        console.log("[v0] Deleting video:", videoId)

        const response = await fetch(`/api/videos/${videoId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setVideos((prevVideos) => prevVideos.filter((video) => video._id !== videoId))
          onRefresh?.()
          console.log("[v0] Video deleted successfully")
        } else {
          alert("Failed to delete video")
        }
      } catch (error) {
        console.error("[v0] Failed to delete video:", error)
        alert("Failed to delete video")
      }
    },
    [onRefresh],
  )

  const handleEditVideo = useCallback(
    async (videoId, updatedData) => {
      try {
        const token = localStorage.getItem("token")
        console.log("[v0] Updating video:", videoId, updatedData)

        const response = await fetch(`/api/videos/${videoId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        })

        if (response.ok) {
          const updatedVideo = await response.json()
          setVideos((prevVideos) => prevVideos.map((video) => (video._id === videoId ? updatedVideo : video)))
          setEditingVideo(null)
          onRefresh?.()
          console.log("[v0] Video updated successfully")
        } else {
          alert("Failed to update video")
        }
      } catch (error) {
        console.error("[v0] Failed to update video:", error)
        alert("Failed to update video")
      }
    },
    [onRefresh],
  )

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value)
  }, [])

  const filteredVideos = useMemo(() => {
    return videos.filter(
      (video) =>
        video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [videos, searchQuery])

  const sortedVideos = useMemo(() => {
    return [...filteredVideos].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt)
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt)
        case "views":
          return (b.views || 0) - (a.views || 0)
        case "likes":
          return (b.likes || 0) - (a.likes || 0)
        default:
          return 0
      }
    })
  }, [filteredVideos, sortBy])

  const sortOptions = useMemo(
    () => [
      { value: "newest", label: "Newest First" },
      { value: "oldest", label: "Oldest First" },
      { value: "views", label: "Most Views" },
      { value: "likes", label: "Most Likes" },
    ],
    [],
  )

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading your videos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">My Videos</h2>
        <Button onClick={() => (window.location.href = "/upload")}>Upload New Video</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input placeholder="Search videos..." value={searchQuery} onChange={handleSearchChange} className="w-full" />
        </div>
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Videos List */}
      <div className="space-y-4">
        {sortedVideos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎥</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No videos found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search terms" : "Start by uploading your first video"}
            </p>
            {!searchQuery && (
              <Button onClick={() => (window.location.href = "/upload")}>Upload Your First Video</Button>
            )}
          </div>
        ) : (
          sortedVideos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              onEdit={setEditingVideo}
              onDelete={handleDeleteVideo}
              onUpdate={handleEditVideo}
            />
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingVideo && (
        <EditVideoModal video={editingVideo} onClose={() => setEditingVideo(null)} onSave={handleEditVideo} />
      )}
    </div>
  )
}

const VideoCard = ({ video, onEdit, onDelete, onUpdate }) => {
  const [showActions, setShowActions] = useState(false)

  const handleEdit = useCallback(() => {
    onEdit(video)
    setShowActions(false)
  }, [video, onEdit])

  const handleDelete = useCallback(() => {
    onDelete(video._id)
    setShowActions(false)
  }, [video._id, onDelete])

  const toggleActions = useCallback(() => {
    setShowActions((prev) => !prev)
  }, [])

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Thumbnail */}
        <div className="w-32 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
          {video.thumbnail ? (
            <img src={video.thumbnail || "/placeholder.svg"} alt={video.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">🎥</span>
          )}
        </div>

        {/* Video Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground mb-2">{video.title || "Untitled Video"}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{video.description || "No description"}</p>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
            <span>👁️ {video.views || 0} views</span>
            <span>❤️ {video.likes || 0} likes</span>
            <span>💬 {video.comments?.length || 0} comments</span>
            <span>📅 {new Date(video.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                video.isPublic
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
              }`}
            >
              {video.isPublic ? "Public" : "Private"}
            </span>
            {video.isFeatured && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button onClick={toggleActions} className="p-2 hover:bg-muted rounded-lg transition-colors">
            ⚙️
          </button>
          {showActions && (
            <div className="absolute right-4 mt-8 bg-background border border-border rounded-lg shadow-lg z-10">
              <button onClick={handleEdit} className="w-full px-4 py-2 text-left hover:bg-muted transition-colors">
                ✏️ Edit
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left hover:bg-muted text-red-600 transition-colors"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const EditVideoModal = ({ video, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: video.title || "",
    description: video.description || "",
    categories: video.categories?.join(", ") || "",
    tags: video.tags?.join(", ") || "",
    isPublic: video.isPublic !== false,
  })

  const handleInputChange = useCallback(
    (field) => (e) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))
    },
    [],
  )

  const handleCheckboxChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      isPublic: e.target.checked,
    }))
  }, [])

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault()
      const updatedData = {
        ...formData,
        categories: formData.categories
          .split(",")
          .map((cat) => cat.trim())
          .filter(Boolean),
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }
      onSave(video._id, updatedData)
    },
    [formData, video._id, onSave],
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-foreground">Edit Video</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title</label>
              <Input value={formData.title} onChange={handleInputChange("title")} placeholder="Video title" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={handleInputChange("description")}
                placeholder="Video description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Categories</label>
                <Input
                  value={formData.categories}
                  onChange={handleInputChange("categories")}
                  placeholder="Gaming, Tech, Music"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
                <Input
                  value={formData.tags}
                  onChange={handleInputChange("tags")}
                  placeholder="tutorial, review, unboxing"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={handleCheckboxChange}
                className="rounded"
              />
              <label htmlFor="isPublic" className="text-sm text-foreground">
                Make video public
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
