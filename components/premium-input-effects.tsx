"use client"

import { useState, useEffect } from "react"

interface PremiumInputEffectsProps {
  isActive: boolean
  variant?: "subtle" | "medium" | "prominent"
  className?: string
}

export default function PremiumInputEffects({
  isActive,
  variant = "subtle",
  className = "",
}: PremiumInputEffectsProps) {
  const [particles, setParticles] = useState<
    Array<{
      id: string
      char: string
      x: number
      y: number
      opacity: number
      scale: number
    }>
  >([])

  useEffect(() => {
    if (!isActive) {
      setParticles([])
      return
    }

    const chars = "0123456789ABCDEF"
    const particleCount = variant === "subtle" ? 3 : variant === "medium" ? 5 : 8

    const generateParticles = () => {
      return Array.from({ length: particleCount }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        char: chars[Math.floor(Math.random() * chars.length)],
        x: 10 + i * (80 / particleCount) + Math.random() * 10,
        y: 20 + Math.random() * 60,
        opacity: 0.1 + Math.random() * 0.2,
        scale: 0.8 + Math.random() * 0.4,
      }))
    }

    setParticles(generateParticles())

    const interval = setInterval(
      () => {
        setParticles(generateParticles())
      },
      2000 + Math.random() * 1000,
    )

    return () => clearInterval(interval)
  }, [isActive, variant])

  if (!isActive || particles.length === 0) return null

  const intensityClass = {
    subtle: "opacity-20",
    medium: "opacity-30",
    prominent: "opacity-40",
  }[variant]

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {particles.map((particle, index) => (
        <div
          key={particle.id}
          className={`absolute font-mono text-xs text-neon-cyan transition-all duration-1000 ${intensityClass}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
            transform: `scale(${particle.scale})`,
            animationDelay: `${index * 200}ms`,
            filter: "blur(0.5px)",
          }}
        >
          {particle.char}
        </div>
      ))}

      {/* Subtle border glow effect */}
      <div
        className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
          isActive ? "shadow-[inset_0_0_20px_rgba(0,209,255,0.1)]" : ""
        }`}
      />
    </div>
  )
}
