"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Lock, Unlock, TrendingUp, Wallet, Shield, RefreshCw, Plus, History } from "lucide-react"
import Link from "next/link"
import MicroInteraction from "@/components/micro-interactions"
import LetterGlitch from "@/components/ui/letter-glitch"
import { useWallet } from "@/hooks/use-wallet"
import { useTokenDetection } from "@/hooks/use-token-detection"
import { getCurrentBlockchainConfig } from "@/lib/blockchain-config"
import { useHistory } from "@/hooks/use-history"
import { CopyButton } from "@/components/ui/copy-button"
import type { HistoryEntry } from "@/lib/encrypted-storage"

export default function Dashboard() {
  const { wallet } = useWallet()
  const { tokens, isLoading: tokensLoading, refreshTokenBalances, scanForTokens } = useTokenDetection(wallet.address)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [recentActivity, setRecentActivity] = useState<HistoryEntry[]>([])
  const [loadingActivity, setLoadingActivity] = useState(false)

  const currentConfig = getCurrentBlockchainConfig()
  const { getRecentActivity, hasHistory } = useHistory()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshTokenBalances()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleRescan = async () => {
    setIsRefreshing(true)
    await scanForTokens()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Load recent activity
  useEffect(() => {
    const loadRecentActivity = async () => {
      if (!wallet.address || !hasHistory) return

      setLoadingActivity(true)
      try {
        const activity = await getRecentActivity(3)
        setRecentActivity(activity)
      } catch (error) {
        console.error("Error loading recent activity:", error)
      } finally {
        setLoadingActivity(false)
      }
    }

    loadRecentActivity()
  }, [wallet.address, hasHistory, getRecentActivity])

  const formatDate = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
    return `${days} day${days > 1 ? "s" : ""} ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-black via-deep-privacy-blue to-midnight-black relative overflow-hidden">
      {/* LetterGlitch Background */}
      <div className="fixed inset-0 z-0 opacity-20">
        <LetterGlitch glitchSpeed={50} centerVignette={true} outerVignette={false} smooth={true} />
      </div>

      {/* Premium Header */}
      <header className="backdrop-blur-xl bg-frosted-gray/5 border-b border-frosted-gray/10 p-6 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Premium Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-deep-privacy-blue/30 backdrop-blur-md border border-neon-cyan/30 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                <Shield className="w-7 h-7 text-neon-cyan" />
              </div>
              <div className="absolute inset-0 w-12 h-12 rounded-2xl border border-neon-cyan/20 animate-pulse group-hover:animate-none"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-neon-cyan bg-clip-text text-transparent">
                Mixion Locker
              </h1>
              <p className="text-xs text-frosted-gray/70">
                {currentConfig.name} • {wallet.isCorrectNetwork ? "Connected" : "Wrong Network"}
              </p>
            </div>
          </div>

          {/* Status & Wallet */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-4 py-2 rounded-2xl bg-emerald-green/10 border border-emerald-green/30 backdrop-blur-md">
              <div className={`w-2 h-2 rounded-full animate-pulse bg-emerald-green`}></div>
              <span className="text-sm font-medium text-emerald-green">
                {tokens.length} Token{tokens.length !== 1 ? "s" : ""} Detected
              </span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-midnight-black/50 border border-frosted-gray/20 backdrop-blur-md">
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-neon-cyan" />
                <span className="text-white font-mono text-sm">
                  {wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : "Not Connected"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-3">Welcome Back</h1>
          <p className="text-xl text-frosted-gray">Manage your locked funds on {currentConfig.name} securely</p>
        </div>

        {/* Main Action Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <Link href="/lock-funds">
            <MicroInteraction trigger="hover" type="glow" intensity="medium" className="rounded-3xl">
              <div className="group p-8 rounded-3xl backdrop-blur-md bg-gradient-to-br from-deep-privacy-blue/20 to-neon-cyan/10 border border-frosted-gray/20 hover:border-neon-cyan/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-center space-x-6 relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-deep-privacy-blue/50 to-neon-cyan/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 backdrop-blur-md border border-neon-cyan/20">
                    <Lock className="w-10 h-10 text-neon-cyan" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors duration-300">
                      Lock Funds
                    </h3>
                    <p className="text-frosted-gray text-lg group-hover:text-white transition-colors duration-300">
                      Secure your crypto with a secret hash
                    </p>
                  </div>
                </div>
              </div>
            </MicroInteraction>
          </Link>

          <Link href="/unlock-funds">
            <MicroInteraction trigger="hover" type="glow" intensity="medium" className="rounded-3xl">
              <div className="group p-8 rounded-3xl backdrop-blur-md bg-gradient-to-br from-emerald-green/20 to-golden-yellow/10 border border-frosted-gray/20 hover:border-emerald-green/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-center space-x-6 relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-green/50 to-golden-yellow/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 backdrop-blur-md border border-emerald-green/20">
                    <Unlock className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-emerald-green transition-colors duration-300">
                      Unlock Funds
                    </h3>
                    <p className="text-frosted-gray text-lg group-hover:text-white transition-colors duration-300">
                      Withdraw using your secret hash
                    </p>
                  </div>
                </div>
              </div>
            </MicroInteraction>
          </Link>
        </div>

        {/* Balances Section */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Your Tokens</h2>
            <div className="flex space-x-3">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-midnight-black/50 text-white border-frosted-gray/30 hover:border-neon-cyan/50 backdrop-blur-md rounded-2xl px-4 py-2"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                onClick={handleRescan}
                disabled={isRefreshing}
                className="bg-deep-privacy-blue/50 text-white border-neon-cyan/30 hover:border-neon-cyan/50 backdrop-blur-md rounded-2xl px-4 py-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Rescan
              </Button>
            </div>
          </div>

          {tokensLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl backdrop-blur-md bg-frosted-gray/10 border border-frosted-gray/20 animate-pulse"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 rounded-2xl bg-frosted-gray/20"></div>
                      <div>
                        <div className="h-5 w-16 bg-frosted-gray/20 rounded mb-2"></div>
                        <div className="h-3 w-24 bg-frosted-gray/20 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-8 w-20 bg-frosted-gray/20 rounded mb-2 ml-auto"></div>
                    <div className="h-4 w-12 bg-frosted-gray/20 rounded ml-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : tokens.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {tokens.map((token) => (
                <Link key={token.address} href={`/lock-funds?token=${token.address}`}>
                  <MicroInteraction trigger="hover" type="glow" intensity="low" className="rounded-2xl">
                    <div className="group p-6 rounded-2xl backdrop-blur-md bg-frosted-gray/10 border border-frosted-gray/20 hover:border-neon-cyan/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-deep-privacy-blue/20 flex items-center justify-center text-2xl backdrop-blur-md border border-neon-cyan/20">
                            {token.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-white">{token.symbol}</h3>
                            <p className="text-sm text-frosted-gray">{token.name}</p>
                          </div>
                        </div>
                        <TrendingUp className="w-5 h-5 text-emerald-green" />
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold text-white ${token.isLoading ? "animate-pulse" : ""}`}>
                          {token.isLoading ? "..." : Number.parseFloat(token.balance).toFixed(4)}
                        </p>
                        <p className="text-frosted-gray">{token.symbol}</p>
                      </div>
                    </div>
                  </MicroInteraction>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-frosted-gray/10 flex items-center justify-center">
                <Wallet className="w-10 h-10 text-frosted-gray" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Tokens Found</h3>
              <p className="text-frosted-gray mb-6">
                We couldn't detect any tokens in your wallet. Try refreshing or make sure you have tokens with balance.
              </p>
              <Button
                onClick={handleRescan}
                className="bg-neon-cyan text-midnight-black font-semibold rounded-2xl px-6 py-3 hover:bg-neon-cyan/80 transition-colors duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Scan for Tokens
              </Button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Recent Activity</h2>
            <Link href="/history">
              <Button className="bg-midnight-black/50 text-white border-frosted-gray/30 hover:border-neon-cyan/50 backdrop-blur-md rounded-2xl px-6 py-3">
                <History className="w-4 h-4 mr-2" />
                View History
              </Button>
            </Link>
          </div>

          {loadingActivity ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl backdrop-blur-md bg-frosted-gray/10 border border-frosted-gray/20 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-2xl bg-frosted-gray/20"></div>
                      <div>
                        <div className="h-5 w-32 bg-frosted-gray/20 rounded mb-2"></div>
                        <div className="h-3 w-24 bg-frosted-gray/20 rounded"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-6 w-16 bg-frosted-gray/20 rounded mb-2"></div>
                      <div className="h-3 w-12 bg-frosted-gray/20 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <MicroInteraction key={activity.id} trigger="hover" type="glow" intensity="low" className="rounded-2xl">
                  <div className="p-6 rounded-2xl backdrop-blur-md bg-frosted-gray/10 border border-frosted-gray/20 hover:border-neon-cyan/30 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md border ${
                            activity.type === "lock"
                              ? "bg-deep-privacy-blue/30 border-neon-cyan/30"
                              : "bg-emerald-green/30 border-emerald-green/30"
                          }`}
                        >
                          {activity.type === "lock" ? (
                            <Lock className="w-7 h-7 text-neon-cyan" />
                          ) : (
                            <Unlock className="w-7 h-7 text-emerald-green" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg">
                            {activity.type === "lock" ? "Locked" : "Unlocked"} {activity.amount} {activity.token.symbol}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-frosted-gray">
                            <span>Secret:</span>
                            <CopyButton text={activity.hash} className="text-frosted-gray hover:text-neon-cyan text-xs">
                              {activity.hash.slice(0, 10)}...
                            </CopyButton>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md border ${
                            activity.status === "completed"
                              ? "bg-emerald-green/20 text-emerald-green border-emerald-green/50"
                              : activity.status === "pending"
                                ? "bg-golden-yellow/20 text-golden-yellow border-golden-yellow/50"
                                : "bg-crimson-red/20 text-crimson-red border-crimson-red/50"
                          }`}
                        >
                          {activity.status}
                        </div>
                        <p className="text-frosted-gray text-sm mt-2">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                </MicroInteraction>
              ))}
            </div>
          ) : hasHistory ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-frosted-gray/10 flex items-center justify-center">
                <History className="w-10 h-10 text-frosted-gray" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Recent Activity</h3>
              <p className="text-frosted-gray mb-6">You have transaction history, but no recent activity to display.</p>
              <Link href="/history">
                <Button className="bg-neon-cyan text-midnight-black font-semibold rounded-2xl px-6 py-3 hover:bg-neon-cyan/80 transition-colors duration-300">
                  <History className="w-4 h-4 mr-2" />
                  View Full History
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-frosted-gray/10 flex items-center justify-center">
                <History className="w-10 h-10 text-frosted-gray" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Transaction History</h3>
              <p className="text-frosted-gray mb-6">
                Your transaction history will appear here after you lock or unlock funds.
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/lock-funds">
                  <Button className="bg-neon-cyan text-midnight-black font-semibold rounded-2xl px-6 py-3 hover:bg-neon-cyan/80 transition-colors duration-300">
                    <Lock className="w-4 h-4 mr-2" />
                    Lock Funds
                  </Button>
                </Link>
                <Link href="/unlock-funds">
                  <Button className="bg-emerald-green text-midnight-black font-semibold rounded-2xl px-6 py-3 hover:bg-emerald-green/80 transition-colors duration-300">
                    <Unlock className="w-4 h-4 mr-2" />
                    Unlock Funds
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
