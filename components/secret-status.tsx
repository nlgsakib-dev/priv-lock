"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, Unlock, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import LetterGlitch from "@/components/ui/letter-glitch"
import MicroInteraction from "@/components/micro-interactions"
import { CopyButton } from "@/components/ui/copy-button"

interface Secret {
  id: string
  hash: string
  currency: string
  amount: string
  status: "active" | "used"
  timestamp: string
  usdValue: string
}

export default function SecretStatus() {
  const [secrets] = useState<Secret[]>([
    {
      id: "1",
      hash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p",
      currency: "ETH",
      amount: "0.5",
      status: "active",
      timestamp: "2 hours ago",
      usdValue: "$820.45",
    },
    {
      id: "2",
      hash: "0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
      currency: "USDC",
      amount: "100",
      status: "used",
      timestamp: "1 day ago",
      usdValue: "$100.00",
    },
    {
      id: "3",
      hash: "0x9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h",
      currency: "DAI",
      amount: "250",
      status: "active",
      timestamp: "3 days ago",
      usdValue: "$250.00",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const filteredSecrets = secrets.filter(
    (secret) =>
      secret.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      secret.currency.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const copySecret = (hash: string) => {
    navigator.clipboard.writeText(hash)
  }

  const navigateToUnlock = (hash: string) => {
    router.push(`/unlock-funds?hash=${hash}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-black via-deep-privacy-blue to-midnight-black relative overflow-hidden">
      {/* LetterGlitch Background */}
      <div className="fixed inset-0 z-0 opacity-20">
        <LetterGlitch glitchSpeed={50} centerVignette={true} outerVignette={false} smooth={true} />
      </div>

      {/* Header */}
      <header className="backdrop-blur-md bg-frosted-gray/10 border-b border-frosted-gray/20 p-6 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center space-x-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-frosted-gray hover:text-neon-cyan transition-colors duration-300"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center space-x-2">
            <Eye className="w-6 h-6 text-neon-cyan" />
            <span className="text-xl font-bold text-white">Secret Status</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Secrets</h1>
          <p className="text-frosted-gray">Manage and monitor all your locked funds</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-frosted-gray" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by hash or currency..."
              className="w-full pl-12 pr-4 py-3 bg-midnight-black/50 border border-frosted-gray/30 rounded-2xl text-white placeholder-frosted-gray focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20 transition-all duration-300"
            />
          </div>
        </div>

        {/* Secrets Grid */}
        <div className="grid gap-6">
          {filteredSecrets.map((secret) => (
            <MicroInteraction key={secret.id} trigger="hover" type="glow" intensity="low" className="rounded-2xl">
              <div className="p-6 rounded-2xl backdrop-blur-md bg-frosted-gray/10 border border-frosted-gray/20 hover:border-neon-cyan/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        secret.status === "active" ? "bg-emerald-green/20" : "bg-frosted-gray/20"
                      }`}
                    >
                      {secret.status === "active" ? (
                        <Lock className="w-6 h-6 text-emerald-green" />
                      ) : (
                        <Unlock className="w-6 h-6 text-frosted-gray" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-semibold text-lg">
                          {secret.amount} {secret.currency}
                        </span>
                        <span className="text-frosted-gray">({secret.usdValue})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-frosted-gray font-mono text-sm">{secret.hash.slice(0, 20)}...</span>
                        <CopyButton
                          text={secret.hash}
                          className="text-frosted-gray hover:text-neon-cyan transition-colors duration-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          secret.status === "active"
                            ? "bg-emerald-green/20 text-emerald-green border border-emerald-green/50"
                            : "bg-frosted-gray/20 text-frosted-gray border border-frosted-gray/50"
                        }`}
                      >
                        {secret.status === "active" ? "Available" : "Used"}
                      </div>
                      <p className="text-frosted-gray text-sm mt-1">{secret.timestamp}</p>
                    </div>

                    {secret.status === "active" && (
                      <Button
                        onClick={() => navigateToUnlock(secret.hash)}
                        className="bg-emerald-green hover:bg-emerald-green/80 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
                      >
                        <Unlock className="w-4 h-4 mr-2" />
                        Unlock
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </MicroInteraction>
          ))}
        </div>

        {filteredSecrets.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-frosted-gray/10 flex items-center justify-center">
              <Eye className="w-10 h-10 text-frosted-gray" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Secrets Found</h3>
            <p className="text-frosted-gray">
              {searchTerm ? "Try adjusting your search terms" : "You haven't locked any funds yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
