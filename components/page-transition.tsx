"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

interface PageTransitionProps {
  children: React.ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const pathname = usePathname()

  useEffect(() => {
    setIsLoading(true)

    const timer = setTimeout(() => {
      setDisplayChildren(children)
      setIsLoading(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [pathname, children])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-midnight-black via-deep-privacy-blue to-midnight-black">
      {/* Loading Overlay - completely covers screen to prevent white flash */}
      {isLoading && (
        <div className="fixed inset-0 z-[99999] bg-gradient-to-br from-midnight-black via-deep-privacy-blue to-midnight-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-neon-cyan/20 to-deep-privacy-blue/20 flex items-center justify-center backdrop-blur-md border border-neon-cyan/30">
              <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin"></div>
            </div>
            <div className="text-neon-cyan font-mono text-sm animate-pulse">Securing Connection...</div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className={`transition-all duration-200 ${isLoading ? "opacity-0" : "opacity-100"}`}>{displayChildren}</div>
    </div>
  )
}
