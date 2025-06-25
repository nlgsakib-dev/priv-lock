"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  text: string
  children?: React.ReactNode
  className?: string
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
}

export function CopyButton({ text, children, className, variant = "ghost", size = "sm" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size={size}
      className={cn(
        "transition-all duration-300 relative overflow-hidden",
        copied && "bg-emerald-green/20 text-emerald-green border-emerald-green/50",
        className,
      )}
    >
      <div className="flex items-center space-x-2">
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            {children && <span>Copied!</span>}
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            {children && <span>{children}</span>}
          </>
        )}
      </div>

      {/* Success animation */}
      {copied && <div className="absolute inset-0 bg-emerald-green/10 animate-pulse rounded-md" />}
    </Button>
  )
}
