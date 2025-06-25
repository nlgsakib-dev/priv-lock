"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Unlock, Eye, CheckCircle, AlertCircle, Copy } from "lucide-react"
import { useRouter } from "next/navigation"
import PremiumInputEffects from "@/components/premium-input-effects"
import MicroInteraction from "@/components/micro-interactions"
import LoadingSpinner from "@/components/loading-spinner"
import LetterGlitch from "@/components/ui/letter-glitch"
import { useWallet } from "@/hooks/use-wallet"
import { useContract } from "@/hooks/use-contract"

interface SecretDetails {
  currency: string
  amount: string
  status: "active" | "used"
  timestamp: string
}

export default function UnlockFunds() {
  const [secretHash, setSecretHash] = useState("")
  const [isHashFocused, setIsHashFocused] = useState(false)
  const [isViewing, setIsViewing] = useState(false)
  const [secretDetails, setSecretDetails] = useState<SecretDetails | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const { wallet, getSigner } = useWallet()
  const { unlockFunds, getSecretDetails, isLoading, error: contractError } = useContract()

  const handleViewSecret = async () => {
    if (!secretHash.trim()) {
      setError("Please enter a secret hash")
      return
    }

    setIsViewing(true)
    setError("")

    const details = await getSecretDetails(secretHash)
    setIsViewing(false)

    if (!details) {
      setError("No funds found for this secret")
      return
    }

    setSecretDetails({
      currency: details.tokenSymbol,
      amount: details.amount,
      status: details.isUsed ? "used" : "active",
      timestamp: "Unknown", // You can add timestamp tracking if needed
    })
  }

  const handleUnlock = async () => {
    if (!wallet.isConnected) {
      setError("Please connect your wallet first")
      return
    }

    const signer = getSigner()
    if (!signer) {
      setError("Unable to get wallet signer")
      return
    }

    const result = await unlockFunds({
      secret: secretHash,
      signer,
    })

    if (result.success) {
      setSuccess(`Successfully unlocked ${result.amount} ${result.tokenSymbol}!`)
      if (secretDetails) {
        setSecretDetails({
          ...secretDetails,
          status: "used",
        })
      }
    }
  }

  const copyHash = () => {
    navigator.clipboard.writeText(secretHash)
  }

  const isUnlockingFunds = isLoading
  const isViewingSecret = isViewing

  useEffect(() => {
    if (contractError) {
      setError(contractError)
    }
  }, [contractError])

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-black via-deep-privacy-blue to-midnight-black relative overflow-hidden">
      {/* LetterGlitch Background */}
      <div className="fixed inset-0 z-0 opacity-20">
        <LetterGlitch glitchSpeed={50} centerVignette={true} outerVignette={false} smooth={true} />
      </div>

      {/* Header */}
      <header className="backdrop-blur-md bg-frosted-gray/10 border-b border-frosted-gray/20 p-6 relative z-10">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-frosted-gray hover:text-neon-cyan transition-colors duration-300"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center space-x-2">
            <Unlock className="w-6 h-6 text-emerald-green" />
            <span className="text-xl font-bold text-white">Unlock Funds</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6 relative z-10">
        <div className="backdrop-blur-md bg-frosted-gray/10 border border-frosted-gray/20 rounded-3xl p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Unlock Your Funds</h1>

          {/* Secret Hash Input */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-3">Secret Hash</label>
            <div className="relative">
              <Input
                type="text"
                value={secretHash}
                onChange={(e) => setSecretHash(e.target.value)}
                onFocus={() => setIsHashFocused(true)}
                onBlur={() => setIsHashFocused(false)}
                placeholder="0x1a2b3c4d5e6f..."
                className="w-full p-4 text-lg bg-midnight-black/50 border border-frosted-gray/30 rounded-2xl text-white placeholder-frosted-gray focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20 font-mono"
              />
              <button
                onClick={copyHash}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-frosted-gray hover:text-neon-cyan transition-colors duration-300"
              >
                <Copy className="w-5 h-5" />
              </button>
              <PremiumInputEffects isActive={isHashFocused} variant="medium" className="rounded-2xl" />
            </div>
          </div>

          {/* View Secret Button */}
          <MicroInteraction trigger="click" type="ripple" intensity="medium">
            <Button
              onClick={handleViewSecret}
              disabled={isViewingSecret || !secretHash.trim()}
              className="w-full py-4 text-lg font-semibold bg-deep-privacy-blue hover:bg-deep-privacy-blue/80 text-white rounded-2xl border-2 border-neon-cyan/30 hover:border-neon-cyan transition-all duration-500 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {isViewingSecret ? (
                <LoadingSpinner size="sm" text="Verifying Secret..." />
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>View Secret Details</span>
                </span>
              )}
            </Button>
          </MicroInteraction>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-crimson-red/20 border border-crimson-red/50 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-crimson-red" />
              <span className="text-crimson-red">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-green/20 border border-emerald-green/50 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-green" />
              <span className="text-emerald-green">{success}</span>
            </div>
          )}

          {/* Secret Details */}
          {secretDetails && (
            <div className="mb-6 p-6 rounded-2xl bg-midnight-black/50 border border-neon-cyan/30">
              <h3 className="text-neon-cyan font-medium mb-4">Secret Details:</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-frosted-gray">Currency:</span>
                  <span className="text-white font-semibold">{secretDetails.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-frosted-gray">Amount:</span>
                  <span className="text-white font-semibold">
                    {secretDetails.amount} {secretDetails.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-frosted-gray">Status:</span>
                  <span
                    className={`font-semibold ${
                      secretDetails.status === "active" ? "text-emerald-green" : "text-crimson-red"
                    }`}
                  >
                    {secretDetails.status === "active" ? "Available" : "Already Used"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-frosted-gray">Locked:</span>
                  <span className="text-white">{secretDetails.timestamp}</span>
                </div>
              </div>

              {/* Unlock Button */}
              {secretDetails.status === "active" && (
                <MicroInteraction trigger="click" type="cipher-burst" intensity="high">
                  <Button
                    onClick={handleUnlock}
                    disabled={isUnlockingFunds}
                    className="w-full mt-6 py-4 text-lg font-semibold bg-emerald-green hover:bg-emerald-green/80 text-white rounded-2xl border-2 border-emerald-green/50 hover:border-emerald-green transition-all duration-500 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUnlockingFunds ? (
                      <LoadingSpinner size="sm" variant="success" text="Unlocking Funds..." />
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <Unlock className="w-5 h-5" />
                        <span>Unlock & Withdraw</span>
                      </span>
                    )}
                  </Button>
                </MicroInteraction>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
