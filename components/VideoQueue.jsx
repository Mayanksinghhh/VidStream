"use client"
import { useState, useEffect } from "react"
import { Play, X, ArrowUp, ArrowDown, Shuffle, List } from "lucide-react"

export default function VideoQueue({
  queue = [],
  currentVideo = null,
  onVideoSelect,
  onRemoveFromQueue,
  onReorderQueue,
  onClearQueue,
  isVisible = false,
  onToggleVisibility,
}) {
  const [localQueue, setLocalQueue] = useState(queue)
  const [draggedIndex, setDraggedIndex] = useState(null)

  useEffect(() => {
    setLocalQueue(queue)
  }, [queue])

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (draggedIndex === null) return

    const newQueue = [...localQueue]
    const draggedItem = newQueue[draggedIndex]
    newQueue.splice(draggedIndex, 1)
    newQueue.splice(dropIndex, 0, draggedItem)

    setLocalQueue(newQueue)
    onReorderQueue(newQueue)
    setDraggedIndex(null)
  }

  const moveVideo = (fromIndex, toIndex) => {
    const newQueue = [...localQueue]
    const item = newQueue.splice(fromIndex, 1)[0]
    newQueue.splice(toIndex, 0, item)
    setLocalQueue(newQueue)
    onReorderQueue(newQueue)
  }

  const shuffleQueue = () => {
    const shuffled = [...localQueue].sort(() => Math.random() - 0.5)
    setLocalQueue(shuffled)
    onReorderQueue(shuffled)
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <>
      {/* Queue Toggle Button */}
      <button
        onClick={onToggleVisibility}
        className="fixed top-20 right-4 z-40 p-3 bg-card border border-border rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        title="Toggle video queue"
      >
        <List className="h-5 w-5" />
        {localQueue.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {localQueue.length}
          </span>
        )}
      </button>

      {/* Queue Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-card border-l border-border shadow-2xl transform transition-transform duration-300 z-30 ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Up Next</h3>
              <button onClick={onToggleVisibility} className="p-1 hover:bg-muted rounded transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{localQueue.length} videos in queue</span>
              <div className="flex space-x-2">
                <button
                  onClick={shuffleQueue}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  title="Shuffle queue"
                >
                  <Shuffle className="h-4 w-4" />
                </button>
                <button
                  onClick={onClearQueue}
                  className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Current Video */}
          {currentVideo && (
            <div className="p-4 border-b border-border bg-purple-500/10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={currentVideo.thumbnailUrl || "/placeholder.png"}
                    alt={currentVideo.title}
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                    <Play className="h-4 w-4 text-white fill-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-2 mb-1">{currentVideo.title}</p>
                  <p className="text-xs text-muted-foreground">Now Playing</p>
                </div>
              </div>
            </div>
          )}

          {/* Queue List */}
          <div className="flex-1 overflow-y-auto">
            {localQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <List className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-2">Your queue is empty</p>
                <p className="text-sm text-muted-foreground/70">Add videos to create your personalized playlist</p>
              </div>
            ) : (
              <div className="p-2">
                {localQueue.map((video, index) => (
                  <div
                    key={video._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className="group flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    {/* Drag Handle & Index */}
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-xs text-muted-foreground font-mono">{index + 1}</span>
                      <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveVideo(index, Math.max(0, index - 1))}
                          disabled={index === 0}
                          className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => moveVideo(index, Math.min(localQueue.length - 1, index + 1))}
                          disabled={index === localQueue.length - 1}
                          className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="relative cursor-pointer" onClick={() => onVideoSelect(video, index)}>
                      <img
                        src={video.thumbnailUrl || "/placeholder.png"}
                        alt={video.title}
                        className="w-20 h-14 object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center rounded transition-colors">
                        <Play className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {video.duration && (
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                          {formatDuration(video.duration)}
                        </span>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium text-sm line-clamp-2 mb-1 cursor-pointer hover:text-purple-400 transition-colors"
                        onClick={() => onVideoSelect(video, index)}
                      >
                        {video.title}
                      </p>
                      <p className="text-xs text-muted-foreground mb-1">{video.uploadedBy?.username || "Unknown"}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {video.views?.toLocaleString() || 0} views
                        </span>
                        <button
                          onClick={() => onRemoveFromQueue(index)}
                          className="p-1 hover:bg-red-500/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                          title="Remove from queue"
                        >
                          <X className="h-3 w-3 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isVisible && <div className="fixed inset-0 bg-black/20 z-20" onClick={onToggleVisibility} />}
    </>
  )
}
