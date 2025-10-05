"use client"
import { useState, useRef, useEffect } from "react"
import { Play, Pause, X, Maximize2, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react"

export default function MiniPlayer({ video, isVisible, onClose, onExpand, position = { bottom: 20, right: 20 } }) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [playerPosition, setPlayerPosition] = useState(position)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const updateTime = () => setCurrentTime(videoElement.currentTime)
    const updateDuration = () => setDuration(videoElement.duration)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    videoElement.addEventListener("timeupdate", updateTime)
    videoElement.addEventListener("loadedmetadata", updateDuration)
    videoElement.addEventListener("play", handlePlay)
    videoElement.addEventListener("pause", handlePause)

    return () => {
      videoElement.removeEventListener("timeupdate", updateTime)
      videoElement.removeEventListener("loadedmetadata", updateDuration)
      videoElement.removeEventListener("play", handlePlay)
      videoElement.removeEventListener("pause", handlePause)
    }
  }, [video])

  const togglePlay = () => {
    const videoElement = videoRef.current
    if (videoElement.paused) {
      videoElement.play()
    } else {
      videoElement.pause()
    }
  }

  const toggleMute = () => {
    const videoElement = videoRef.current
    if (isMuted) {
      videoElement.volume = volume
      setIsMuted(false)
    } else {
      videoElement.volume = 0
      setIsMuted(true)
    }
  }

  const skipTime = (seconds) => {
    const videoElement = videoRef.current
    videoElement.currentTime = Math.max(0, Math.min(duration, videoElement.currentTime + seconds))
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    const newPosition = {
      right: window.innerWidth - e.clientX + dragOffset.x - 320, // 320px is player width
      bottom: window.innerHeight - e.clientY + dragOffset.y - 180, // 180px is player height
    }

    // Keep within bounds
    newPosition.right = Math.max(20, Math.min(window.innerWidth - 340, newPosition.right))
    newPosition.bottom = Math.max(20, Math.min(window.innerHeight - 200, newPosition.bottom))

    setPlayerPosition(newPosition)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (!isVisible || !video) return null

  return (
    <div
      className="fixed z-50 bg-card border border-border rounded-lg shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl"
      style={{
        right: `${playerPosition.right}px`,
        bottom: `${playerPosition.bottom}px`,
        width: "320px",
        height: "180px",
      }}
    >
      {/* Drag Handle */}
      <div
        className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 cursor-move flex items-center justify-between px-3"
        onMouseDown={handleMouseDown}
      >
        <span className="text-xs font-medium text-foreground/80 truncate max-w-[200px]">{video.title}</span>
        <div className="flex items-center space-x-1">
          <button
            onClick={onExpand}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Expand to full player"
          >
            <Maximize2 className="h-3 w-3 text-foreground/80" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-500/20 rounded transition-colors"
            title="Close mini player"
          >
            <X className="h-3 w-3 text-foreground/80" />
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative mt-8 h-[calc(100%-32px)]">
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="w-full h-full object-cover bg-black"
          onClick={togglePlay}
          muted={isMuted}
          volume={volume}
        />

        {/* Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200">
          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button onClick={togglePlay} className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
              {isPlaying ? (
                <Pause className="h-4 w-4 text-white" />
              ) : (
                <Play className="h-4 w-4 text-white fill-white" />
              )}
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-2">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/30 rounded-full mb-2">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <button onClick={() => skipTime(-5)} className="p-1 hover:bg-white/20 rounded transition-colors">
                  <SkipBack className="h-3 w-3 text-white" />
                </button>
                <button onClick={() => skipTime(5)} className="p-1 hover:bg-white/20 rounded transition-colors">
                  <SkipForward className="h-3 w-3 text-white" />
                </button>
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-white text-xs">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <button onClick={toggleMute} className="p-1 hover:bg-white/20 rounded transition-colors">
                  {isMuted ? <VolumeX className="h-3 w-3 text-white" /> : <Volume2 className="h-3 w-3 text-white" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
