"use client"
import { useState, useEffect } from "react"
import { UserPlus, UserCheck, Bell, BellOff } from "lucide-react"

export default function SubscribeButton({ channelId }) {
  const [subscribers, setSubscribers] = useState(0)
  const [subscribed, setSubscribed] = useState(false)
  const [notifications, setNotifications] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch current subscription status on mount
  useEffect(() => {
    let ignore = false
    const run = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const res = await fetch(`/api/users/${channelId}/subscribe`, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: "no-store",
        })
        if (!res.ok) return
        const data = await res.json()
        if (!ignore) {
          setSubscribers(data.subscribers ?? 0)
          setSubscribed(!!data.isSubscribed)
        }
      } catch (e) {
        // keep defaults
      }
    }
    if (channelId) run()
    return () => {
      ignore = true
    }
  }, [channelId])

  const handleSubscribe = async () => {
    if (loading) return
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/users/${channelId}/subscribe`, {
        method: subscribed ? "DELETE" : "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (res.ok) {
        const data = await res.json()
        setSubscribed(!subscribed)
        setSubscribers(data.subscribers ?? subscribers + (subscribed ? -1 : 1))
      }
    } catch (error) {
      console.error("Error toggling subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationToggle = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/users/${channelId}/notifications`, {
        method: notifications ? "DELETE" : "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (res.ok) {
        setNotifications(!notifications)
      }
    } catch (error) {
      console.error("Error toggling notifications:", error)
    }
  }

  const formatSubscriberCount = (count) => {
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
    return `${(count / 1000000).toFixed(1)}M`
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
          subscribed
            ? "bg-muted text-muted-foreground hover:bg-muted/80"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {subscribed ? (
          <>
            <UserCheck className="h-4 w-4" />
            <span>Subscribed</span>
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            <span>Subscribe</span>
          </>
        )}
      </button>

      <span className="text-sm text-muted-foreground">{formatSubscriberCount(subscribers)} subscribers</span>

      {subscribed && (
        <button
          onClick={handleNotificationToggle}
          className={`p-2 rounded-lg transition-colors ${
            notifications ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          title={notifications ? "Turn off notifications" : "Turn on notifications"}
        >
          {notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        </button>
      )}
    </div>
  )
}
