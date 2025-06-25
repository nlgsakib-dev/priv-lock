"use client"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  variant?: "primary" | "success" | "warning"
  text?: string
}

export default function LoadingSpinner({ size = "md", variant = "primary", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  const colorClasses = {
    primary: "border-neon-cyan/30 border-t-neon-cyan",
    success: "border-emerald-green/30 border-t-emerald-green",
    warning: "border-golden-yellow/30 border-t-golden-yellow",
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={`${sizeClasses[size]} border-2 ${colorClasses[variant]} rounded-full animate-spin`} />
      {text && <div className="text-frosted-gray text-sm font-mono animate-pulse">{text}</div>}
    </div>
  )
}
