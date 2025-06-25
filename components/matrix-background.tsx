"use client"

import LetterGlitch from "@/components/ui/letter-glitch"

export default function MatrixBackground() {
  return (
    <div className="fixed inset-0 z-0 opacity-20">
      <LetterGlitch
        glitchColors={["#1E3A8A", "#00D1FF", "#10B981"]}
        glitchSpeed={80}
        centerVignette={false}
        outerVignette={true}
        smooth={true}
      />
    </div>
  )
}
