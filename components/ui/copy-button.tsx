"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  text: string
  className?: string
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  children?: React.ReactNode
}

export function CopyButton({ text, className, variant = "ghost", size = "icon", children }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(
        "transition-all duration-300 relative overflow-hidden",
        copied && "bg-emerald-green/20 border-emerald-green/50",
        className,
      )}
    >
      <div className={cn("flex items-center space-x-2 transition-all duration-300", copied && "scale-110")}>
        {copied ? <Check className="w-4 h-4 text-emerald-green" /> : <Copy className="w-4 h-4" />}
        {children && <span>{children}</span>}
      </div>

      {/* Copy animation */}
      {copied && <div className="absolute inset-0 bg-emerald-green/10 animate-pulse rounded-md" />}
    </Button>
  )
}
