"use client"
import { useState, useRef, useEffect } from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Settings,
  Maximize,
  Minimize,
  PictureInPicture,
} from "lucide-react"

export default function VideoPlayer({ src }) {
  const videoRef = useRef(null)
  const progressRef = useRef(null)
  const containerRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isPictureInPicture, setIsPictureInPicture] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [controlsTimeout, setControlsTimeout] = useState(null)

  const controlsTimeoutRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleWaiting = () => setBuffering(true)
    const handleCanPlay = () => setBuffering(false)
    const handleLoadStart = () => setBuffering(true)
    const handleLoadedData = () => setBuffering(false)

    video.addEventListener("timeupdate", updateTime)
    video.addEventListener("loadedmetadata", updateDuration)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("loadstart", handleLoadStart)
    video.addEventListener("loadeddata", handleLoadedData)

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      video.removeEventListener("loadedmetadata", updateDuration)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("loadstart", handleLoadStart)
      video.removeEventListener("loadeddata", handleLoadedData)
    }
  }, [])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return

      switch (e.code) {
        case "Space":
          e.preventDefault()
          togglePlay()
          break
        case "ArrowLeft":
          e.preventDefault()
          skipTime(-5)
          break
        case "ArrowRight":
          e.preventDefault()
          skipTime(5)
          break
        case "ArrowUp":
          e.preventDefault()
          changeVolume(Math.min(1, volume + 0.1))
          break
        case "ArrowDown":
          e.preventDefault()
          changeVolume(Math.max(0, volume - 0.1))
          break
        case "KeyM":
          e.preventDefault()
          toggleMute()
          break
        case "KeyF":
          e.preventDefault()
          toggleFullscreen()
          break
        case "KeyP":
          e.preventDefault()
          togglePictureInPicture()
          break
        case "Digit0":
          e.preventDefault()
          videoRef.current.currentTime = 0
          break
        case "Digit1":
          e.preventDefault()
          videoRef.current.currentTime = duration * 0.1
          break
        case "Digit2":
          e.preventDefault()
          videoRef.current.currentTime = duration * 0.2
          break
        case "Digit3":
          e.preventDefault()
          videoRef.current.currentTime = duration * 0.3
          break
        case "Digit4":
          e.preventDefault()
          videoRef.current.currentTime = duration * 0.4
          break
        case "Digit5":
          e.preventDefault()
          videoRef.current.currentTime = duration * 0.5
          break
        case "Digit6":
          e.preventDefault()
          videoRef.current.currentTime = duration * 0.6
          break
        case "Digit7":
          e.preventDefault()
          videoRef.current.currentTime = duration * 0.7
          break
        case "Digit8":
          e.preventDefault()
          videoRef.current.currentTime = duration * 0.8
          break
        case "Digit9":
          e.preventDefault()
          videoRef.current.currentTime = duration * 0.9
          break
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [volume, duration])

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      // clear old timeout if any
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }

      // set new timeout
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    // cleanup on unmount
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [showControls])
  const togglePlay = () => {
    const video = videoRef.current
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const handleSeek = (e) => {
    const video = videoRef.current
    const rect = progressRef.current.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    video.currentTime = pos * duration
  }

  const skipTime = (seconds) => {
    const video = videoRef.current
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
  }

  const changeVolume = (newVolume) => {
    setVolume(newVolume)
    videoRef.current.volume = newVolume
    setIsMuted(newVolume === 0)
  }

  const handleVolumeChange = (e) => {
    const newVolume = Number.parseFloat(e.target.value)
    changeVolume(newVolume)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const togglePictureInPicture = async () => {
    const video = videoRef.current
    if (!document.pictureInPictureElement) {
      try {
        await video.requestPictureInPicture()
        setIsPictureInPicture(true)
      } catch (error) {
        console.log("Picture-in-picture not supported")
      }
    } else {
      try {
        await document.exitPictureInPicture()
        setIsPictureInPicture(false)
      } catch (error) {
        console.log("Error exiting picture-in-picture")
      }
    }
  }

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate)
    videoRef.current.playbackRate = rate
  }

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen()
        } else if (containerRef.current.webkitRequestFullscreen) {
          await containerRef.current.webkitRequestFullscreen()
        } else if (containerRef.current.msRequestFullscreen) {
          await containerRef.current.msRequestFullscreen()
        }
        setIsFullscreen(true)
      } catch (error) {
        console.log("Fullscreen not supported")
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen()
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen()
        }
        setIsFullscreen(false)
      } catch (error) {
        console.log("Error exiting fullscreen")
      }
    }
  }

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [])

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-card border border-accent rounded-xl overflow-hidden group shadow-sm"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onMouseMove={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full max-h-[70vh] bg-black"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        preload="metadata"
      />

      {/* Buffering Spinner */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      <div
        className={`absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
      >
        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-white/70 rounded-full hover:bg-white transition-colors border border-accent"
            title="Settings"
          >
            <Settings className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={togglePictureInPicture}
            className="p-2 bg-white/70 rounded-full hover:bg-white transition-colors border border-accent"
            title="Picture-in-Picture"
          >
            <PictureInPicture className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/70 rounded-full hover:bg-white transition-colors border border-accent"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5 text-foreground" />
            ) : (
              <Maximize className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="p-4 bg-white/80 rounded-full hover:bg-white transition-colors border border-accent shadow"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 text-foreground" />
            ) : (
              <Play className="h-8 w-8 text-red-500 fill-red-500" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div
            ref={progressRef}
            className="w-full h-1 bg-muted rounded-full cursor-pointer mb-4 relative"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-primary rounded-full transition-all duration-100 relative"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => skipTime(-10)} className="p-2 hover:bg-muted rounded transition-colors">
                <SkipBack className="h-5 w-5 text-foreground" />
              </button>
              <button onClick={() => skipTime(10)} className="p-2 hover:bg-muted rounded transition-colors">
                <SkipForward className="h-5 w-5 text-foreground" />
              </button>
              <span className="text-foreground/80 text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-muted rounded transition-colors"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-foreground" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-foreground" />
                  )}
                </button>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className={`w-20 h-1 video-player-range transition-all duration-200 ${
                      showVolumeSlider ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
              </div>

              <select
                value={playbackRate}
                onChange={(e) => changePlaybackRate(Number.parseFloat(e.target.value))}
                className="bg-white/80 text-foreground text-sm px-2 py-1 rounded border border-accent outline-none"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-16 right-4 bg-card text-foreground p-4 rounded-lg border border-accent min-w-[200px] z-50 shadow">
            <h3 className="font-semibold mb-3">Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Playback Speed</label>
                <select
                  value={playbackRate}
                  onChange={(e) => changePlaybackRate(Number.parseFloat(e.target.value))}
                  className="w-full bg-white/20 text-white text-sm px-2 py-1 rounded border-none outline-none"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="pt-2 border-t border-white/20">
                <h4 className="text-sm font-medium mb-2">Keyboard Shortcuts</h4>
                <div className="text-xs space-y-1 text-white/70">
                  <div>Space - Play/Pause</div>
                  <div>← → - Skip 5s</div>
                  <div>↑ ↓ - Volume</div>
                  <div>M - Mute</div>
                  <div>F - Fullscreen</div>
                  <div>P - Picture-in-Picture</div>
                  <div>0-9 - Jump to %</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
