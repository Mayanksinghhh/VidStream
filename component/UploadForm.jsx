"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

export default function UploadForm() {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) return alert("Select a video first")
    setUploading(true)
    setProgress(0)

    try {
      const sigRes = await fetch("/api/upload/signature")
      if (!sigRes.ok) throw new Error("Failed to get signature")
      const { timestamp, signature, apiKey, cloudName, folder, eager, uploadUrl } = await sigRes.json()

      const uploadData = new FormData()
      uploadData.append("file", file)
      uploadData.append("api_key", apiKey)
      uploadData.append("timestamp", String(timestamp))
      uploadData.append("signature", signature)
      uploadData.append("folder", folder)
      uploadData.append("resource_type", "video")
      uploadData.append("eager", eager)

      // Use XHR for progress updates
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("POST", uploadUrl, true)
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100))
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText)
          else reject(new Error("Cloudinary upload failed"))
        }
        xhr.onerror = () => reject(new Error("Cloudinary upload error"))
        xhr.send(uploadData)
      }).then(async (cloudinaryResponseText) => {
        const uploaded = JSON.parse(cloudinaryResponseText)

        // Notify our API to create the Video document without re-uploading
        const form = new FormData()
        form.append("title", title)
        form.append("description", description)
        form.append("publicId", uploaded.public_id)
        form.append("secure_url", uploaded.secure_url)
        form.append("thumbnail_url", (uploaded.eager && uploaded.eager[0]?.secure_url) || uploaded.secure_url)
        if (uploaded.duration) form.append("duration", String(Math.round(uploaded.duration)))

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const res = await fetch("/api/videos/upload", {
          method: "POST",
          headers: token ? { Authorization: "Bearer " + token } : undefined,
          body: form,
        })

        if (!res.ok) throw new Error("Failed to save video")
        const data = await res.json()
        alert("Uploaded: " + data.video._id)
        setFile(null)
        setTitle("")
        setDescription("")
        setProgress(0)
      })
    } catch (err) {
      console.error("[UploadForm] error", err)
      // Fallback to original server-side upload if signature flow fails
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("title", title)
        formData.append("description", description)

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const xhr = new XMLHttpRequest()
        xhr.open("POST", "/api/videos/upload", true)
        if (token) xhr.setRequestHeader("Authorization", "Bearer " + token)

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setProgress(Math.round((ev.loaded / ev.total) * 100))
          }
        }
        xhr.onload = () => {
          setUploading(false)
          if (xhr.status === 201) {
            const res = JSON.parse(xhr.responseText)
            alert("Uploaded: " + res.video._id)
            setFile(null)
            setTitle("")
            setDescription("")
            setProgress(0)
          } else {
            alert("Upload failed")
          }
        }
        xhr.onerror = () => {
          setUploading(false)
          alert("Upload error")
        }
        xhr.send(formData)
        return
      } catch {
        alert("Upload failed")
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} className="w-full text-white" />
      {uploading && (
        <div className="w-full">
          <Progress value={progress} className="w-full" />
          <p className="text-sm">{progress}%</p>
        </div>
      )}
      <Button type="submit" disabled={uploading}>
        Upload
      </Button>
    </form>
  )
}
