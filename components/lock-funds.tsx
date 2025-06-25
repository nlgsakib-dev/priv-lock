"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, ChevronDown, Sparkles, Plus, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import PremiumInputEffects from "@/components/premium-input-effects"
import MicroInteraction from "@/components/micro-interactions"
import LetterGlitch from "@/components/ui/letter-glitch"
import LoadingSpinner from "@/components/loading-spinner"
import { useWallet } from "@/hooks/use-wallet"
import { useContract } from "@/hooks/use-contract"
import { useTokenDetection } from "@/hooks/use-token-detection"
import { isValidERC20 } from "@/lib/contract-utils"
import { useHistory } from "@/hooks/use-history"
import { CopyButton } from "@/components/ui/copy-button"

export default function LockFunds() {
  const { wallet, getSigner } = useWallet()
  const { lockFunds, checkTokenAllowance, approveToken, isLoading, error } = useContract()
  const { tokens, addCustomToken, isLoading: tokensLoading } = useTokenDetection(wallet.address)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addHistoryEntry } = useHistory()

  const [selectedToken, setSelectedToken] = useState(tokens[0] || null)
  const [amount, setAmount] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [secretHash, setSecretHash] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [isAmountFocused, setIsAmountFocused] = useState(false)
  const [customTokenAddress, setCustomTokenAddress] = useState("")
  const [showCustomToken, setShowCustomToken] = useState(false)
  const [isAddingToken, setIsAddingToken] = useState(false)

  // Set initial token from URL params or first available token
  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam && tokens.length > 0) {
      const foundToken = tokens.find(
        (t) =>
          t.address.toLowerCase() === tokenParam.toLowerCase() || t.symbol.toLowerCase() === tokenParam.toLowerCase(),
      )
      if (foundToken) {
        setSelectedToken(foundToken)
      }
    } else if (tokens.length > 0 && !selectedToken) {
      setSelectedToken(tokens[0])
    }
  }, [tokens, searchParams, selectedToken])

  const handleTokenSelect = (token: typeof selectedToken) => {
    setSelectedToken(token)
    setIsDropdownOpen(false)
    setNeedsApproval(!token?.isNative || false)
    setAmount("")
  }

  const handleAddCustomToken = async () => {
    if (!customTokenAddress.trim()) return

    setIsAddingToken(true)

    // Validate if it's a valid ERC20
    const isValid = await isValidERC20(customTokenAddress)
    if (!isValid) {
      alert("Invalid ERC20 token address")
      setIsAddingToken(false)
      return
    }

    const success = await addCustomToken(customTokenAddress)
    if (success) {
      setCustomTokenAddress("")
      setShowCustomToken(false)
    } else {
      alert("Failed to add token or token has zero balance")
    }

    setIsAddingToken(false)
  }

  const handleApprove = async () => {
    if (!wallet.isConnected || !selectedToken) return

    const signer = getSigner()
    if (!signer) return

    setIsApproving(true)
    const success = await approveToken(selectedToken.address, amount, selectedToken.decimals, signer)

    if (success) {
      setNeedsApproval(false)
    }
    setIsApproving(false)
  }

  const handleLock = async () => {
    if (!wallet.isConnected || !selectedToken) return

    const signer = getSigner()
    if (!signer) return

    const result = await lockFunds({
      amount,
      token: selectedToken,
      signer,
    })

    if (result.success) {
      setSecretHash(result.secret)
      setShowSuccess(true)

      // Add to history
      await addHistoryEntry({
        type: "lock",
        amount,
        token: {
          symbol: selectedToken.symbol,
          name: selectedToken.name,
          address: selectedToken.address,
          decimals: selectedToken.decimals,
        },
        hash: result.secret,
        txHash: result.txHash,
        status: "completed",
      })
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secretHash)
  }

  const isValidAmount =
    amount &&
    selectedToken &&
    Number.parseFloat(amount) > 0 &&
    Number.parseFloat(amount) <= Number.parseFloat(selectedToken.balance)

  const isLockingFunds = isLoading

  // Show loading state while tokens are being detected
  if (tokensLoading) {
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
              <Lock className="w-6 h-6 text-neon-cyan" />
              <span className="text-xl font-bold text-white">Lock Funds</span>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto p-6 relative z-10 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" text="Detecting your tokens..." />
            <p className="text-frosted-gray mt-4">
              We're scanning your wallet for available tokens. This may take a moment.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show no tokens found only if loading is complete and no tokens exist
  if (!tokensLoading && tokens.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight-black via-deep-privacy-blue to-midnight-black flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No Tokens Found</h2>
          <p className="text-frosted-gray mb-6">
            We couldn't detect any tokens in your wallet. Please make sure you have tokens with balance.
          </p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-neon-cyan text-midnight-black font-semibold rounded-2xl px-6 py-3 hover:bg-neon-cyan/80 transition-colors duration-300"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

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
            <Lock className="w-6 h-6 text-neon-cyan" />
            <span className="text-xl font-bold text-white">Lock Funds</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6 relative z-10">
        {!showSuccess ? (
          <div className="backdrop-blur-md bg-frosted-gray/10 border border-frosted-gray/20 rounded-3xl p-8">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">Lock Your Funds</h1>

            {/* Token Selector */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-white font-medium">Select Token</label>
                <button
                  onClick={() => setShowCustomToken(!showCustomToken)}
                  className="text-neon-cyan hover:text-neon-cyan/80 transition-colors duration-300 text-sm"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add Custom Token
                </button>
              </div>

              {/* Custom Token Input */}
              {showCustomToken && (
                <div className="mb-4 p-4 rounded-2xl bg-midnight-black/50 border border-frosted-gray/30">
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      value={customTokenAddress}
                      onChange={(e) => setCustomTokenAddress(e.target.value)}
                      placeholder="0x... Token Contract Address"
                      className="flex-1 bg-midnight-black/50 border-frosted-gray/30 text-white"
                    />
                    <Button
                      onClick={handleAddCustomToken}
                      disabled={isAddingToken || !customTokenAddress.trim()}
                      className="bg-neon-cyan text-midnight-black px-4 py-2 rounded-xl hover:bg-neon-cyan/80"
                    >
                      {isAddingToken ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                    </Button>
                  </div>
                </div>
              )}

              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full p-4 rounded-2xl bg-midnight-black/80 backdrop-blur-md border border-frosted-gray/30 text-white flex items-center justify-between hover:border-neon-cyan/50 hover:bg-midnight-black/90 transition-all duration-300 relative z-10"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan/20 to-deep-privacy-blue/20 flex items-center justify-center text-xl">
                      {selectedToken?.isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-neon-cyan" />
                      ) : (
                        selectedToken?.icon
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{selectedToken?.symbol}</p>
                      <p className="text-sm text-frosted-gray">{selectedToken?.name}</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 backdrop-blur-xl bg-midnight-black/95 border border-frosted-gray/30 rounded-2xl overflow-hidden z-50 shadow-2xl max-h-60 overflow-y-auto">
                    {tokens.map((token) => (
                      <button
                        key={token.address}
                        onClick={() => handleTokenSelect(token)}
                        className="w-full p-4 text-left hover:bg-neon-cyan/20 transition-colors duration-300 flex items-center space-x-3 border-b border-frosted-gray/10 last:border-b-0"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan/20 to-deep-privacy-blue/20 flex items-center justify-center text-xl">
                          {token.isLoading ? <Loader2 className="w-5 h-5 animate-spin text-neon-cyan" /> : token.icon}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{token.symbol}</p>
                          <p className="text-xs text-frosted-gray">{token.name}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-white font-semibold">
                            {token.isLoading ? "..." : Number.parseFloat(token.balance).toFixed(4)}
                          </p>
                          <p className="text-xs text-frosted-gray">Available</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-3">Amount to Lock</label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onFocus={() => setIsAmountFocused(true)}
                  onBlur={() => setIsAmountFocused(false)}
                  placeholder="0.00"
                  className="w-full p-4 text-xl bg-midnight-black/50 border border-frosted-gray/30 rounded-2xl text-white placeholder-frosted-gray focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-frosted-gray">
                  {selectedToken?.symbol}
                </div>
                <PremiumInputEffects isActive={isAmountFocused} variant="subtle" className="rounded-2xl" />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-frosted-gray">
                  Balance: {selectedToken ? Number.parseFloat(selectedToken.balance).toFixed(4) : "0.00"}{" "}
                  {selectedToken?.symbol}
                </span>
                <button
                  onClick={() => selectedToken && setAmount(selectedToken.balance)}
                  className="text-neon-cyan hover:text-neon-cyan/80 transition-colors duration-300"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Approval Section */}
            {needsApproval && selectedToken && !selectedToken.isNative && (
              <div className="mb-6 p-4 rounded-2xl bg-golden-yellow/10 border border-golden-yellow/30">
                <p className="text-golden-yellow mb-3">This token requires approval before locking.</p>
                <Button
                  onClick={handleApprove}
                  disabled={isApproving || !isValidAmount}
                  className="w-full py-3 bg-golden-yellow hover:bg-golden-yellow/80 text-midnight-black font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
                >
                  {isApproving ? "Approving..." : "Approve Token"}
                </Button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-crimson-red/20 border border-crimson-red/50 text-crimson-red">
                {error}
              </div>
            )}

            {/* Lock Button */}
            <MicroInteraction trigger="click" type="cipher-burst" intensity="high">
              <Button
                onClick={handleLock}
                disabled={!isValidAmount || needsApproval || isLockingFunds}
                className="w-full py-4 text-lg font-semibold bg-deep-privacy-blue hover:bg-deep-privacy-blue/80 text-white rounded-2xl border-2 border-neon-cyan/30 hover:border-neon-cyan transition-all duration-500 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLockingFunds ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Locking Funds...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Lock className="w-5 h-5" />
                    <span>Lock Funds</span>
                  </span>
                )}
              </Button>
            </MicroInteraction>
          </div>
        ) : (
          /* Success Modal */
          <div className="backdrop-blur-md bg-frosted-gray/10 border border-emerald-green/50 rounded-3xl p-8 text-center relative overflow-hidden">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-green/20 flex items-center justify-center relative z-10">
              <Sparkles className="w-10 h-10 text-emerald-green animate-pulse" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-4 relative z-10">Funds Locked Successfully!</h2>
            <p className="text-frosted-gray mb-8 relative z-10">
              Your {amount} {selectedToken?.symbol} has been locked securely. Save your secret hash to unlock the funds
              later.
            </p>

            <div className="mb-8 p-6 rounded-2xl bg-midnight-black/50 border border-neon-cyan/30 relative z-10">
              <p className="text-neon-cyan font-medium mb-3">Your Secret Hash:</p>
              <div className="p-4 rounded-xl bg-midnight-black/70 border border-frosted-gray/20 mb-4 relative">
                <p className="text-white font-mono text-sm break-all">{secretHash}</p>
              </div>
              <CopyButton
                text={secretHash}
                className="w-full py-3 bg-neon-cyan hover:bg-neon-cyan/80 text-midnight-black font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                Copy Secret Hash
              </CopyButton>
            </div>

            <div className="space-y-4 relative z-10">
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full py-3 bg-deep-privacy-blue hover:bg-deep-privacy-blue/80 text-white rounded-2xl transition-all duration-300"
              >
                Back to Dashboard
              </Button>
              <Button
                onClick={() => {
                  setShowSuccess(false)
                  setAmount("")
                  setSecretHash("")
                }}
                variant="outline"
                className="w-full py-3 bg-midnight-black/50 text-white border-frosted-gray/30 hover:border-neon-cyan/50 rounded-2xl transition-all duration-300"
              >
                Lock More Funds
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
