"use client"

import { useState, useEffect } from "react"

interface CipherElement {
  id: number
  text: string
  x: number
  y: number
  speed: number
  opacity: number
  type: "flow" | "matrix" | "rotate"
}

export default function LiveCipherBackground() {
  const [cipherElements, setCipherElements] = useState<CipherElement[]>([])

  const generateCipherText = (length = 16) => {
    const chars = "0123456789ABCDEFabcdef"
    let result = "0x"
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const generateBinaryString = (length = 32) => {
    let result = ""
    for (let i = 0; i < length; i++) {
      result += Math.random() > 0.5 ? "1" : "0"
    }
    return result
  }

  const generateHashString = () => {
    const chars = "0123456789abcdef"
    let result = ""
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  useEffect(() => {
    const createCipherElement = (): CipherElement => {
      const types: ("flow" | "matrix" | "rotate")[] = ["flow", "matrix", "rotate"]
      const type = types[Math.floor(Math.random() * types.length)]

      let text = ""
      switch (type) {
        case "flow":
          text = generateCipherText(Math.floor(Math.random() * 20) + 10)
          break
        case "matrix":
          text = generateBinaryString(Math.floor(Math.random() * 40) + 20)
          break
        case "rotate":
          text = generateHashString().slice(0, Math.floor(Math.random() * 30) + 10)
          break
      }

      return {
        id: Math.random(),
        text,
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: Math.random() * 3 + 1,
        opacity: Math.random() * 0.4 + 0.1,
        type,
      }
    }

    // Initial cipher elements
    const initialElements = Array.from({ length: 15 }, createCipherElement)
    setCipherElements(initialElements)

    // Add new elements periodically
    const interval = setInterval(() => {
      setCipherElements((prev) => {
        const newElements = [...prev]

        // Remove old elements
        if (newElements.length > 20) {
          newElements.splice(0, 5)
        }

        // Add new elements
        for (let i = 0; i < 3; i++) {
          newElements.push(createCipherElement())
        }

        return newElements
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {cipherElements.map((element) => (
        <div
          key={element.id}
          className={`absolute font-mono text-xs text-neon-cyan whitespace-nowrap select-none ${
            element.type === "flow" ? "cipher-flow" : element.type === "matrix" ? "cipher-matrix" : "cipher-rotate"
          }`}
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            opacity: element.opacity,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        >
          {element.text}
        </div>
      ))}

      {/* Static corner elements for consistent presence */}
      <div className="absolute top-10 left-10 text-neon-cyan/20 font-mono text-xs animate-pulse">
        SHA256: a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3
      </div>
      <div className="absolute top-10 right-10 text-neon-cyan/20 font-mono text-xs animate-pulse delay-1000">
        AES-256: 2b7e151628aed2a6abf7158809cf4f3c
      </div>
      <div className="absolute bottom-10 left-10 text-neon-cyan/20 font-mono text-xs animate-pulse delay-2000">
        RSA-2048: 30820122300d06092a864886f70d01010105000382010f003082010a0282010100
      </div>
      <div className="absolute bottom-10 right-10 text-neon-cyan/20 font-mono text-xs animate-pulse delay-3000">
        ECDSA:
        04678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5f
      </div>
    </div>
  )
}
