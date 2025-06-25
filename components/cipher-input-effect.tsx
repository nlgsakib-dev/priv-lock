"use client"

import { useState, useEffect } from "react"

interface CipherInputEffectProps {
  isActive: boolean
  className?: string
}

export default function CipherInputEffect({ isActive, className = "" }: CipherInputEffectProps) {
  const [cipherChars, setCipherChars] = useState<string[]>([])

  useEffect(() => {
    if (!isActive) {
      setCipherChars([])
      return
    }

    const chars = "0123456789ABCDEFabcdef"
    const generateChars = () => {
      const newChars = []
      for (let i = 0; i < 20; i++) {
        newChars.push(chars.charAt(Math.floor(Math.random() * chars.length)))
      }
      return newChars
    }

    setCipherChars(generateChars())

    const interval = setInterval(() => {
      setCipherChars(generateChars())
    }, 150)

    return () => clearInterval(interval)
  }, [isActive])

  if (!isActive || cipherChars.length === 0) return null

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {cipherChars.map((char, index) => (
        <span
          key={index}
          className="absolute text-neon-cyan/30 font-mono text-xs animate-pulse"
          style={{
            left: `${(index * 5) % 100}%`,
            top: `${Math.floor(index / 20) * 25}%`,
            animationDelay: `${index * 50}ms`,
          }}
        >
          {char}
        </span>
      ))}
    </div>
  )
}
