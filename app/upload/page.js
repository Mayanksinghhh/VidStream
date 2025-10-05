"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function UploadVideo() {
  const [video, setVideo] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categories, setCategories] = useState("")
  const [tags, setTags] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [videos, setVideos] = useState([])
  const [previewUrl, setPreviewUrl] = useState(null) // preview URL

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!video) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", video)
      formData.append("title", title)
      formData.append("description", description)
      formData.append("categories", categories)
      formData.append("tags", tags)

      const token = localStorage.getItem("token")

      const res = await fetch("/api/videos/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setVideos((prev) => [...prev, data.video])
        setTitle("")
        setDescription("")
        setCategories("")
        setTags("")
        setVideo(null)
        setPreviewUrl(null) // reset preview URL after upload
      } else {
        console.error("Upload failed:", data)
      }
    } catch (err) {
      console.error("Upload error:", err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen upload-page-bg flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold text-center mb-4">Upload Video</h1>

        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Video Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
          <Input
            placeholder="Categories (comma-separated, e.g., Gaming, Entertainment)"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
          />
          <Input
            placeholder="Tags (comma-separated, e.g., tutorial, beginner, fun)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const f = e.target.files?.[0] || null
              setVideo(f)
              if (f) {
                const url = URL.createObjectURL(f)
                setPreviewUrl(url)
              } else {
                setPreviewUrl(null)
              }
            }}
            required
            className="file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:bg-accent file:text-foreground"
          />
          {previewUrl && (
            <div className="rounded-lg border border-border p-3 bg-card">
              <p className="text-sm mb-2 text-muted-foreground">Preview</p>
              <video
                src={previewUrl}
                controls
                muted
                playsInline
                className="rounded-md w-full"
                crossOrigin="anonymous"
              />
            </div>
          )}
          <Button type="submit" disabled={isUploading || !video}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </form>

        {videos.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4 text-center">Uploaded Videos</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((v, idx) => (
                <li key={idx} className="flex flex-col items-center">
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <video src={v.videoUrl} controls className="rounded-lg shadow-lg w-full" />
                  <p className="text-sm text-gray-400 mt-2">{v.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
