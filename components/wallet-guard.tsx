"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/hooks/use-wallet"
import LoadingSpinner from "@/components/loading-spinner"

interface WalletGuardProps {
  children: React.ReactNode
  requireConnection?: boolean
  requireCorrectNetwork?: boolean
}

export default function WalletGuard({
  children,
  requireConnection = true,
  requireCorrectNetwork = true,
}: WalletGuardProps) {
  const { wallet, isConnecting, switchNetwork, isEthersLoaded } = useWallet()
  const router = useRouter()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    // Wait for ethers to load before checking wallet state
    if (!isEthersLoaded) return

    // Add a small delay to prevent immediate redirects
    const timer = setTimeout(() => {
      setHasChecked(true)

      if (requireConnection && !isConnecting && !wallet.isConnected) {
        router.push("/connect-wallet")
      }
    }, 1000) // 1 second delay

    return () => clearTimeout(timer)
  }, [wallet.isConnected, isConnecting, requireConnection, router, isEthersLoaded])

  // Show loading while ethers is loading or checking wallet state
  if (!isEthersLoaded || !hasChecked || isConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight-black via-deep-privacy-blue to-midnight-black flex items-center justify-center">
        <LoadingSpinner size="lg" text={!isEthersLoaded ? "Loading libraries..." : "Checking wallet connection..."} />
      </div>
    )
  }

  if (requireConnection && !wallet.isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight-black via-deep-privacy-blue to-midnight-black flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Wallet Required</h2>
          <p className="text-frosted-gray mb-6">Please connect your wallet to continue</p>
          <button
            onClick={() => router.push("/connect-wallet")}
            className="px-6 py-3 bg-neon-cyan text-midnight-black font-semibold rounded-2xl hover:bg-neon-cyan/80 transition-colors duration-300"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  if (requireCorrectNetwork && wallet.isConnected && !wallet.isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight-black via-deep-privacy-blue to-midnight-black flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Wrong Network</h2>
          <p className="text-frosted-gray mb-6">Please switch to MindChain network</p>
          <button
            onClick={switchNetwork}
            className="px-6 py-3 bg-golden-yellow text-midnight-black font-semibold rounded-2xl hover:bg-golden-yellow/80 transition-colors duration-300"
          >
            Switch Network
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
