"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Lock, Unlock, Eye, TrendingUp, Wallet, Shield, RefreshCw, Plus } from "lucide-react"
import Link from "next/link"
import MicroInteraction from "@/components/micro-interactions"
import LetterGlitch from "@/components/ui/letter-glitch"
import { useWallet } from "@/hooks/use-wallet"
import { useTokenDetection } from "@/hooks/use-token-detection"
import { getCurrentBlockchainConfig } from "@/lib/blockchain-config"

export default function Dashboard() {
  const { wallet } = useWallet()
  const { tokens, isLoading: tokensLoading, refreshTokenBalances, scanForTokens } = useTokenDetection(wallet.address)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const currentConfig = getCurrentBlockchainConfig()

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

  const [recentActivity] = useState([
    { type: "lock", amount: "0.5 MIND", hash: "0x1a2b...3c4d", status: "active", timestamp: "2 hours ago" },
    { type: "unlock", amount: "100 USDC", hash: "0x5e6f...7g8h", status: "completed", timestamp: "1 day ago" },
  ])

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
            <Link href="/secret-status">
              <Button className="bg-midnight-black/50 text-white border-frosted-gray/30 hover:border-neon-cyan/50 backdrop-blur-md rounded-2xl px-6 py-3">
                <Eye className="w-4 h-4 mr-2" />
                View All Secrets
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl backdrop-blur-md bg-frosted-gray/10 border border-frosted-gray/20 hover:border-neon-cyan/30 transition-all duration-300"
              >
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
                        {activity.type === "lock" ? "Locked" : "Unlocked"} {activity.amount}
                      </p>
                      <p className="text-frosted-gray text-sm">Secret: {activity.hash}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md ${
                        activity.status === "active"
                          ? "bg-emerald-green/20 text-emerald-green border border-emerald-green/50"
                          : "bg-frosted-gray/20 text-frosted-gray border border-frosted-gray/50"
                      }`}
                    >
                      {activity.status}
                    </div>
                    <p className="text-frosted-gray text-sm mt-2">{activity.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
