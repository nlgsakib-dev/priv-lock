"use client"

import type React from "react"

import { useState } from "react"

interface MicroInteractionProps {
  trigger: "hover" | "click" | "focus"
  type: "ripple" | "glow" | "cipher-burst"
  intensity?: "low" | "medium" | "high"
  children: React.ReactNode
  className?: string
}

export default function MicroInteraction({
  trigger,
  type,
  intensity = "medium",
  children,
  className = "",
}: MicroInteractionProps) {
  const [isActive, setIsActive] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: string; x: number; y: number }>>([])

  const handleInteraction = (event: React.MouseEvent) => {
    if (type === "ripple" || type === "cipher-burst") {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 100
      const y = ((event.clientY - rect.top) / rect.height) * 100

      const newRipple = {
        id: `${Date.now()}-${Math.random()}`,
        x,
        y,
      }

      setRipples((prev) => [...prev, newRipple])

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, 1000)
    }

    setIsActive(true)
    setTimeout(() => setIsActive(false), 600)
  }

  const getIntensityClasses = () => {
    const intensityMap = {
      ripple: {
        low: "bg-neon-cyan/10",
        medium: "bg-neon-cyan/20",
        high: "bg-neon-cyan/30",
      },
      glow: {
        low: "shadow-[0_0_10px_rgba(0,209,255,0.2)]",
        medium: "shadow-[0_0_20px_rgba(0,209,255,0.3)]",
        high: "shadow-[0_0_30px_rgba(0,209,255,0.4)]",
      },
      "cipher-burst": {
        low: "opacity-20",
        medium: "opacity-30",
        high: "opacity-40",
      },
    }

    return intensityMap[type][intensity]
  }

  const eventHandlers = {
    hover: {
      onMouseEnter: () => setIsActive(true),
      onMouseLeave: () => setIsActive(false),
    },
    click: {
      onClick: handleInteraction,
    },
    focus: {
      onFocus: () => setIsActive(true),
      onBlur: () => setIsActive(false),
    },
  }

  return (
    <div className={`relative overflow-hidden ${className}`} {...eventHandlers[trigger]}>
      {children}

      {/* Ripple effects */}
      {type === "ripple" &&
        ripples.map((ripple) => (
          <div
            key={ripple.id}
            className={`absolute rounded-full animate-ping ${getIntensityClasses()}`}
            style={{
              left: `${ripple.x}%`,
              top: `${ripple.y}%`,
              width: "20px",
              height: "20px",
              transform: "translate(-50%, -50%)",
              animationDuration: "1s",
            }}
          />
        ))}

      {/* Glow effect */}
      {type === "glow" && (
        <div
          className={`absolute inset-0 rounded-inherit transition-all duration-300 ${
            isActive ? getIntensityClasses() : ""
          }`}
        />
      )}

      {/* Cipher burst effect */}
      {type === "cipher-burst" && isActive && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className={`absolute font-mono text-xs text-neon-cyan animate-pulse ${getIntensityClasses()}`}
              style={{
                left: `${20 + i * 12}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 100}ms`,
                animationDuration: "600ms",
              }}
            >
              {Math.random().toString(16)[2] || "0"}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
