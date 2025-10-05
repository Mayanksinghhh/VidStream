"use client"
import { useState, useEffect } from "react"
import { Palette, Sun, Moon, Monitor, Check } from "lucide-react"

const ACCENT_COLORS = [
  { name: "Purple", value: "purple", class: "bg-purple-500" },
  { name: "Blue", value: "blue", class: "bg-blue-500" },
  { name: "Green", value: "green", class: "bg-green-500" },
  { name: "Red", value: "red", class: "bg-red-500" },
  { name: "Orange", value: "orange", class: "bg-orange-500" },
  { name: "Pink", value: "pink", class: "bg-pink-500" },
  { name: "Cyan", value: "cyan", class: "bg-cyan-500" },
  { name: "Yellow", value: "yellow", class: "bg-yellow-500" },
]

const THEME_MODES = [
  { name: "Light", value: "light", icon: Sun },
  { name: "Dark", value: "dark", icon: Moon },
  { name: "System", value: "system", icon: Monitor },
]

export default function ThemeCustomizer({ isVisible, onClose }) {
  const [currentTheme, setCurrentTheme] = useState("dark")
  const [currentAccent, setCurrentAccent] = useState("purple")

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem("theme") || "dark"
    const savedAccent = localStorage.getItem("accent-color") || "purple"
    setCurrentTheme(savedTheme)
    setCurrentAccent(savedAccent)
    applyTheme(savedTheme, savedAccent)
  }, [])

  const applyTheme = (theme, accent) => {
    const root = document.documentElement

    // Apply theme mode
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.toggle("dark", systemTheme === "dark")
    } else {
      root.classList.toggle("dark", theme === "dark")
    }

    // Apply accent color
    root.setAttribute("data-accent", accent)

    // Update CSS custom properties for accent color
    const accentColors = {
      purple: { primary: "147 51 234", secondary: "139 92 246" },
      blue: { primary: "59 130 246", secondary: "96 165 250" },
      green: { primary: "34 197 94", secondary: "74 222 128" },
      red: { primary: "239 68 68", secondary: "248 113 113" },
      orange: { primary: "249 115 22", secondary: "251 146 60" },
      pink: { primary: "236 72 153", secondary: "244 114 182" },
      cyan: { primary: "6 182 212", secondary: "34 211 238" },
      yellow: { primary: "234 179 8", secondary: "250 204 21" },
    }

    if (accentColors[accent]) {
      root.style.setProperty("--color-primary", accentColors[accent].primary)
      root.style.setProperty("--color-primary-foreground", "255 255 255")
    }
  }

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme)
    localStorage.setItem("theme", theme)
    applyTheme(theme, currentAccent)
  }

  const handleAccentChange = (accent) => {
    setCurrentAccent(accent)
    localStorage.setItem("accent-color", accent)
    applyTheme(currentTheme, accent)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Customize Theme</span>
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded transition-colors">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Theme Mode Selection */}
          <div>
            <h3 className="font-medium mb-3">Theme Mode</h3>
            <div className="grid grid-cols-3 gap-3">
              {THEME_MODES.map((mode) => {
                const IconComponent = mode.icon
                return (
                  <button
                    key={mode.value}
                    onClick={() => handleThemeChange(mode.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      currentTheme === mode.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <IconComponent className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{mode.name}</span>
                    {currentTheme === mode.value && <Check className="h-4 w-4 text-primary mx-auto mt-1" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Accent Color Selection */}
          <div>
            <h3 className="font-medium mb-3">Accent Color</h3>
            <div className="grid grid-cols-4 gap-3">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleAccentChange(color.value)}
                  className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                    currentAccent === color.value ? "border-current scale-105" : "border-border hover:border-current/50"
                  }`}
                  style={{
                    borderColor:
                      currentAccent === color.value
                        ? `rgb(${
                            color.value === "purple"
                              ? "147 51 234"
                              : color.value === "blue"
                                ? "59 130 246"
                                : color.value === "green"
                                  ? "34 197 94"
                                  : color.value === "red"
                                    ? "239 68 68"
                                    : color.value === "orange"
                                      ? "249 115 22"
                                      : color.value === "pink"
                                        ? "236 72 153"
                                        : color.value === "cyan"
                                          ? "6 182 212"
                                          : "234 179 8"
                          })`
                        : undefined,
                  }}
                >
                  <div className={`w-8 h-8 rounded-full ${color.class} mx-auto mb-2`} />
                  <span className="text-xs font-medium">{color.name}</span>
                  {currentAccent === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-5 w-5 text-white bg-black/50 rounded-full p-1" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="font-medium mb-3">Preview</h3>
            <div className="p-4 rounded-lg border border-border bg-background">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold">U</span>
                  </div>
                  <div>
                    <p className="font-medium">Sample Video Title</p>
                    <p className="text-sm text-muted-foreground">Creator Name • 1.2K views</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">
                    Subscribe
                  </button>
                  <button className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">Like</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <button
            onClick={() => {
              handleThemeChange("dark")
              handleAccentChange("purple")
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 -z-10" onClick={onClose} />
    </div>
  )
}
