"use client"

import { useState, useEffect, useCallback, useMemo } from "react"

interface CipherParticle {
  id: string
  content: string
  x: number
  y: number
  layer: number
  animationType: "drift" | "cascade" | "breathe" | "float"
  delay: number
  duration: number
  opacity: number
  blur: "light" | "medium" | "heavy"
  size: "xs" | "sm" | "base"
}

const CIPHER_PATTERNS = {
  hash: () => Array.from({ length: 12 }, () => Math.random().toString(16)[2] || "0").join(""),
  binary: () => Array.from({ length: 16 }, () => (Math.random() > 0.5 ? "1" : "0")).join(""),
  hex: () => "0x" + Array.from({ length: 8 }, () => Math.random().toString(16)[2] || "0").join(""),
  algorithm: () => {
    const algos = ["SHA256", "AES256", "RSA2048", "ECDSA", "PBKDF2", "HMAC"]
    return algos[Math.floor(Math.random() * algos.length)]
  },
}

export default function SophisticatedCipherBackground() {
  const [particles, setParticles] = useState<CipherParticle[]>([])

  const createParticle = useCallback((): CipherParticle => {
    const patternKeys = Object.keys(CIPHER_PATTERNS) as Array<keyof typeof CIPHER_PATTERNS>
    const patternType = patternKeys[Math.floor(Math.random() * patternKeys.length)]
    const animationTypes: CipherParticle["animationType"][] = ["drift", "cascade", "breathe", "float"]

    return {
      id: `${Date.now()}-${Math.random()}`,
      content: CIPHER_PATTERNS[patternType](),
      x: Math.random() * 100,
      y: Math.random() * 100,
      layer: Math.floor(Math.random() * 3) + 1,
      animationType: animationTypes[Math.floor(Math.random() * animationTypes.length)],
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 15,
      opacity: 0.05 + Math.random() * 0.15,
      blur: ["light", "medium", "heavy"][Math.floor(Math.random() * 3)] as CipherParticle["blur"],
      size: ["xs", "sm", "base"][Math.floor(Math.random() * 3)] as CipherParticle["size"],
    }
  }, [])

  const particleConfig = useMemo(
    () => ({
      maxParticles: 12,
      spawnInterval: 4000,
      cleanupThreshold: 20,
    }),
    [],
  )

  useEffect(() => {
    // Initialize with fewer, more carefully placed particles
    const initialParticles = Array.from({ length: 6 }, createParticle)
    setParticles(initialParticles)

    const spawnInterval = setInterval(() => {
      setParticles((prev) => {
        const filtered = prev.length > particleConfig.cleanupThreshold ? prev.slice(-particleConfig.maxParticles) : prev

        if (filtered.length < particleConfig.maxParticles) {
          return [...filtered, createParticle()]
        }
        return filtered
      })
    }, particleConfig.spawnInterval)

    return () => clearInterval(spawnInterval)
  }, [createParticle, particleConfig])

  const getParticleClasses = useCallback((particle: CipherParticle) => {
    const baseClasses = [
      "absolute font-mono select-none pointer-events-none",
      `cipher-${particle.animationType}`,
      `cipher-layer-${particle.layer}`,
      `cipher-blur-${particle.blur}`,
      particle.size === "xs" ? "text-xs" : particle.size === "sm" ? "text-sm" : "text-base",
    ]
    return baseClasses.join(" ")
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={getParticleClasses(particle)}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            color: "#00D1FF",
            opacity: particle.opacity,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            willChange: "transform, opacity",
          }}
        >
          {particle.content}
        </div>
      ))}

      {/* Sophisticated corner anchors with organic movement */}
      <div className="absolute top-8 left-8 cipher-float-organic cipher-blur-light">
        <div className="text-neon-cyan/10 font-mono text-xs tracking-wider">SECURE_HASH_PROTOCOL</div>
      </div>

      <div className="absolute top-8 right-8 cipher-float-organic cipher-blur-light" style={{ animationDelay: "2s" }}>
        <div className="text-neon-cyan/10 font-mono text-xs tracking-wider">ENCRYPTION_LAYER_256</div>
      </div>

      <div className="absolute bottom-8 left-8 cipher-float-organic cipher-blur-light" style={{ animationDelay: "4s" }}>
        <div className="text-neon-cyan/10 font-mono text-xs tracking-wider">CRYPTOGRAPHIC_VAULT</div>
      </div>

      <div
        className="absolute bottom-8 right-8 cipher-float-organic cipher-blur-light"
        style={{ animationDelay: "6s" }}
      >
        <div className="text-neon-cyan/10 font-mono text-xs tracking-wider">DECENTRALIZED_PROTOCOL</div>
      </div>
    </div>
  )
}
