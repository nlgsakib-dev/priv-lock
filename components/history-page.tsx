"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { History, Lock, Unlock, Search, Shield, Eye, EyeOff, Trash2, ExternalLink, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import LetterGlitch from "@/components/ui/letter-glitch"
import MicroInteraction from "@/components/micro-interactions"
import LoadingSpinner from "@/components/loading-spinner"
import { CopyButton } from "@/components/ui/copy-button"
import { useHistory } from "@/hooks/use-history"
import { useWallet } from "@/hooks/use-wallet"
import { getCurrentBlockchainConfig } from "@/lib/blockchain-config"

export default function HistoryPage() {
  const router = useRouter()
  const { wallet } = useWallet()
  const { history, isLoading, error, isUnlocked, unlockHistory, lockHistory, clearHistory, hasHistory } = useHistory()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "lock" | "unlock">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed" | "failed">("all")

  const currentConfig = getCurrentBlockchainConfig()

  const filteredHistory = history.filter((entry) => {
    const matchesSearch =
      entry.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.txHash?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || entry.type === filterType
    const matchesStatus = filterStatus === "all" || entry.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const handleUnlockHistory = async () => {
    const success = await unlockHistory()
    if (!success && error) {
      console.error("Failed to unlock history:", error)
    }
  }

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear all history? This action cannot be undone.")) {
      await clearHistory()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-green border-emerald-green/50 bg-emerald-green/20"
      case "pending":
        return "text-golden-yellow border-golden-yellow/50 bg-golden-yellow/20"
      case "failed":
        return "text-crimson-red border-crimson-red/50 bg-crimson-red/20"
      default:
        return "text-frosted-gray border-frosted-gray/50 bg-frosted-gray/20"
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const openInExplorer = (txHash: string) => {
    if (currentConfig.blockExplorerUrl && txHash) {
      window.open(`${currentConfig.blockExplorerUrl}/tx/${txHash}`, "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-black via-deep-privacy-blue to-midnight-black relative overflow-hidden">
      {/* LetterGlitch Background */}
      <div className="fixed inset-0 z-0 opacity-20">
        <LetterGlitch glitchSpeed={50} centerVignette={true} outerVignette={false} smooth={true} />
      </div>

      {/* Header */}
      <header className="backdrop-blur-md bg-frosted-gray/10 border-b border-frosted-gray/20 p-6 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-frosted-gray hover:text-neon-cyan transition-colors duration-300"
            >
              ← Back to Dashboard
            </button>
            <div className="flex items-center space-x-2">
              <History className="w-6 h-6 text-neon-cyan" />
              <span className="text-xl font-bold text-white">Transaction History</span>
            </div>
          </div>

          {isUnlocked && (
            <div className="flex items-center space-x-3">
              <Button
                onClick={lockHistory}
                variant="outline"
                className="bg-midnight-black/50 text-white border-frosted-gray/30 hover:border-neon-cyan/50"
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Lock History
              </Button>
              <Button
                onClick={handleClearHistory}
                variant="outline"
                className="bg-crimson-red/20 text-crimson-red border-crimson-red/30 hover:border-crimson-red/50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 relative z-10">
        {!hasHistory ? (
          /* No History */
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <MicroInteraction trigger="hover" type="glow" intensity="medium" className="rounded-3xl">
                <div className="p-8 rounded-3xl backdrop-blur-md bg-frosted-gray/10 border border-frosted-gray/20">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-frosted-gray/20 to-deep-privacy-blue/20 flex items-center justify-center">
                    <History className="w-10 h-10 text-frosted-gray" />
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-4">No Transaction History</h2>
                  <p className="text-frosted-gray mb-8">
                    You haven't made any transactions yet. Your encrypted history will appear here after you lock or
                    unlock funds.
                  </p>

                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => router.push("/lock-funds")}
                      className="bg-neon-cyan hover:bg-neon-cyan/80 text-midnight-black font-semibold rounded-2xl px-6 py-3 transition-all duration-300"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Lock Funds
                    </Button>
                    <Button
                      onClick={() => router.push("/unlock-funds")}
                      className="bg-emerald-green hover:bg-emerald-green/80 text-midnight-black font-semibold rounded-2xl px-6 py-3 transition-all duration-300"
                    >
                      <Unlock className="w-4 h-4 mr-2" />
                      Unlock Funds
                    </Button>
                  </div>
                </div>
              </MicroInteraction>
            </div>
          </div>
        ) : !isUnlocked ? (
          /* Unlock Screen */
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <MicroInteraction trigger="hover" type="glow" intensity="medium" className="rounded-3xl">
                <div className="p-8 rounded-3xl backdrop-blur-md bg-frosted-gray/10 border border-frosted-gray/20 hover:border-neon-cyan/50 transition-all duration-500">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-neon-cyan/20 to-deep-privacy-blue/20 flex items-center justify-center">
                    <Shield className="w-10 h-10 text-neon-cyan" />
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-4">Encrypted History</h2>
                  <p className="text-frosted-gray mb-8">
                    Your transaction history is encrypted and stored securely. Sign with your wallet to decrypt and view
                    your history.
                  </p>

                  {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-crimson-red/20 border border-crimson-red/50 text-crimson-red text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleUnlockHistory}
                    disabled={isLoading}
                    className="w-full py-3 bg-neon-cyan hover:bg-neon-cyan/80 text-midnight-black font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center space-x-2">
                        <LoadingSpinner size="sm" />
                        <span>Unlocking...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <Eye className="w-5 h-5" />
                        <span>Unlock History</span>
                      </span>
                    )}
                  </Button>
                </div>
              </MicroInteraction>
            </div>
          </div>
        ) : (
          /* History Content */
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Transaction History</h1>
              <p className="text-frosted-gray">Your encrypted transaction history on {currentConfig.name}</p>
            </div>

            {/* Filters */}
            <div className="mb-8 grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-frosted-gray" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search transactions..."
                  className="pl-12 bg-midnight-black/50 border-frosted-gray/30 text-white"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 bg-midnight-black/50 border border-frosted-gray/30 rounded-lg text-white"
              >
                <option value="all">All Types</option>
                <option value="lock">Lock</option>
                <option value="unlock">Unlock</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 bg-midnight-black/50 border border-frosted-gray/30 rounded-lg text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>

              <div className="flex items-center text-frosted-gray">
                <Filter className="w-4 h-4 mr-2" />
                <span className="text-sm">{filteredHistory.length} transactions</span>
              </div>
            </div>

            {/* History List */}
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-frosted-gray/10 flex items-center justify-center">
                  <History className="w-10 h-10 text-frosted-gray" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchTerm || filterType !== "all" || filterStatus !== "all"
                    ? "No Matching Transactions"
                    : "No Transaction History"}
                </h3>
                <p className="text-frosted-gray">
                  {searchTerm || filterType !== "all" || filterStatus !== "all"
                    ? "Try adjusting your search or filters"
                    : "Your transaction history will appear here"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((entry) => (
                  <MicroInteraction key={entry.id} trigger="hover" type="glow" intensity="low" className="rounded-2xl">
                    <div className="p-6 rounded-2xl backdrop-blur-md bg-frosted-gray/10 border border-frosted-gray/20 hover:border-neon-cyan/50 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              entry.type === "lock"
                                ? "bg-deep-privacy-blue/30 border border-neon-cyan/30"
                                : "bg-emerald-green/30 border border-emerald-green/30"
                            }`}
                          >
                            {entry.type === "lock" ? (
                              <Lock className="w-6 h-6 text-neon-cyan" />
                            ) : (
                              <Unlock className="w-6 h-6 text-emerald-green" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-white font-semibold text-lg">
                                {entry.type === "lock" ? "Locked" : "Unlocked"} {entry.amount} {entry.token.symbol}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(entry.status)}`}
                              >
                                {entry.status}
                              </span>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-frosted-gray">
                              <span>{formatDate(entry.timestamp)}</span>
                              <span>•</span>
                              <span>{entry.token.name}</span>
                              {entry.blockNumber && (
                                <>
                                  <span>•</span>
                                  <span>Block #{entry.blockNumber}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <CopyButton text={entry.hash} className="text-frosted-gray hover:text-neon-cyan">
                            Secret
                          </CopyButton>

                          {entry.txHash && (
                            <>
                              <CopyButton text={entry.txHash} className="text-frosted-gray hover:text-neon-cyan">
                                TX
                              </CopyButton>

                              <Button
                                onClick={() => openInExplorer(entry.txHash!)}
                                variant="ghost"
                                size="icon"
                                className="text-frosted-gray hover:text-neon-cyan"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </MicroInteraction>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
