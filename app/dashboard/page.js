"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import VideoManagement from "@/components/dashboard/VideoManagement"
import Analytics from "@/components/dashboard/Analytics"
import DraftsScheduling from "@/components/dashboard/DraftsScheduling"
import ProfileManagement from "@/components/dashboard/ProfileManagement"
import DashboardStats from "@/components/dashboard/DashboardStats"

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [dashboardData, setDashboardData] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardData = useCallback(async () => {
    if (!user) return

    try {
      setLoadingData(true)
      const token = localStorage.getItem("token")
      console.log("[v0] Fetching dashboard data with token:", token ? "Present" : "Missing")

      const response = await fetch("/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("[v0] Dashboard API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Dashboard data received:", data)
        setDashboardData(data)
        setError(null) // Clear error on successful fetch
      } else {
        const errorData = await response.json()
        console.error("[v0] Dashboard API error:", errorData)
        setError(errorData.error || "Failed to fetch dashboard data")
      }
    } catch (error) {
      console.error("[v0] Failed to fetch dashboard data:", error)
      setError("Network error: " + error.message)
    } finally {
      setLoadingData(false)
    }
  }, [user]) // Added user as dependency

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, fetchDashboardData])

  const handleRetry = useCallback(() => {
    setError(null)
    fetchDashboardData()
  }, [fetchDashboardData])

  if (loading || loadingData) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Not Logged In</h2>
          <p className="text-muted-foreground mb-4">Please log in to access the dashboard</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "videos", label: "My Videos", icon: "🎥" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "drafts", label: "Drafts & Schedule", icon: "📝" },
    { id: "profile", label: "Profile", icon: "👤" },
  ]

  return (
    <div className="min-h-screen dashboard-bg">
      {/* Header */}
      <header className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">StreamPro Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-2xl shadow-lg border border-border/50 p-6">
              {activeTab === "overview" && <DashboardStats data={dashboardData} onRefresh={fetchDashboardData} />}
              {activeTab === "videos" && (
                <VideoManagement userId={user?._id || user?.id} onRefresh={fetchDashboardData} />
              )}
              {activeTab === "analytics" && <Analytics userId={user?._id || user?.id} data={dashboardData} />}
              {activeTab === "drafts" && (
                <DraftsScheduling userId={user?._id || user?.id} onRefresh={fetchDashboardData} />
              )}
              {activeTab === "profile" && <ProfileManagement user={user} onUpdate={fetchDashboardData} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
