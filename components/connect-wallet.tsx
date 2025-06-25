"use client"
import { useState } from "react"
import { Wallet, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import LetterGlitch from "@/components/ui/letter-glitch"
import DecryptedText from "@/components/ui/decrypted-text"
import StarBorder from "@/components/ui/star-border"
import LoadingSpinner from "@/components/loading-spinner"
import { useWallet } from "@/hooks/use-wallet"

export default function ConnectWallet() {
  const router = useRouter()
  const { wallet, isConnecting, error, connectWallet, isEthersLoaded } = useWallet()
  const [hasConnected, setHasConnected] = useState(false)

  const handleConnect = async () => {
    const success = await connectWallet()
    if (success) {
      setHasConnected(true)
      // Small delay to show success state before redirect
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    }
  }

  const handleGoToDashboard = () => {
    router.push("/dashboard")
  }

  // Show loading while ethers is loading
  if (!isEthersLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight-black via-deep-privacy-blue to-midnight-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* LetterGlitch Background */}
        <div className="fixed inset-0 z-0 opacity-20">
          <LetterGlitch glitchSpeed={50} centerVignette={true} outerVignette={false} smooth={true} />
        </div>

        <div className="relative z-10">
          <LoadingSpinner size="lg" text="Loading wallet libraries..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-black via-deep-privacy-blue to-midnight-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* LetterGlitch Background */}
      <div className="fixed inset-0 z-0 opacity-20">
        <LetterGlitch glitchSpeed={50} centerVignette={true} outerVignette={false} smooth={true} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="backdrop-blur-md bg-frosted-gray/10 border border-frosted-gray/20 rounded-3xl p-8 text-center">
          {/* Animated Wallet Icon */}
          <div className="mb-8 relative">
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${
                wallet.isConnected || hasConnected
                  ? "bg-emerald-green/20 border-emerald-green/50"
                  : "bg-neon-cyan/20 border-neon-cyan/30"
              } border-2 backdrop-blur-md`}
            >
              {isConnecting ? (
                <Loader2 className="w-10 h-10 text-neon-cyan animate-spin" />
              ) : wallet.isConnected || hasConnected ? (
                <CheckCircle className="w-10 h-10 text-emerald-green" />
              ) : (
                <Wallet className="w-10 h-10 text-neon-cyan animate-pulse" />
              )}
            </div>
            {!wallet.isConnected && !hasConnected && (
              <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-neon-cyan/20 animate-ping"></div>
            )}
          </div>

          {/* Content */}
          {!wallet.isConnected && !hasConnected ? (
            <>
              <DecryptedText
                text="Connect Your Wallet"
                className="text-3xl font-bold text-white mb-4"
                encryptedClassName="text-neon-cyan/60"
                speed={50}
                maxIterations={12}
                sequential={true}
              />
              <p className="text-frosted-gray mb-8">
                Connect your MetaMask wallet to start using Mixion Locker securely.
              </p>

              <StarBorder
                as="button"
                color="#00D1FF"
                speed="5s"
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full transform hover:scale-[1.02] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="py-2">
                  {isConnecting ? (
                    <span className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-lg font-semibold">Connecting...</span>
                    </span>
                  ) : (
                    <span className="text-lg font-semibold">Connect MetaMask</span>
                  )}
                </div>
              </StarBorder>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-white mb-4">Connected!</h1>
              <p className="text-frosted-gray mb-4">
                Address: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
              </p>
              <p className="text-frosted-gray mb-6">
                Balance: {wallet.balance ? Number.parseFloat(wallet.balance).toFixed(4) : "0"} MIND
              </p>

              <div className="space-y-4">
                <StarBorder
                  as="button"
                  color="#10B981"
                  speed="3s"
                  onClick={handleGoToDashboard}
                  className="w-full transform hover:scale-[1.02] transition-all duration-500"
                >
                  <div className="py-2">
                    <span className="text-lg font-semibold">Go to Dashboard</span>
                  </div>
                </StarBorder>

                <p className="text-frosted-gray text-sm">
                  {hasConnected ? "Redirecting to dashboard..." : "Click above to continue"}
                </p>
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-crimson-red/20 border border-crimson-red/50 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-crimson-red" />
              <span className="text-crimson-red text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="text-frosted-gray hover:text-neon-cyan transition-colors duration-300"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
