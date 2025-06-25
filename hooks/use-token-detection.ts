"use client"

import { useState, useEffect, useCallback } from "react"
import { getProvider, getTokenContract } from "@/lib/contract-utils"
import { getNativeToken } from "@/lib/blockchain-config"
import type { TokenConfig } from "@/lib/blockchain-config"

interface DetectedToken extends TokenConfig {
  balance: string
  isLoading: boolean
}

export function useTokenDetection(address: string | null) {
  const [tokens, setTokens] = useState<DetectedToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ethers, setEthers] = useState<any>(null)
  const [isEthersLoaded, setIsEthersLoaded] = useState(false)

  // Load ethers dynamically with proper error handling
  useEffect(() => {
    let mounted = true

    const loadEthers = async () => {
      try {
        const ethersModule = await import("ethers")
        if (mounted) {
          setEthers(ethersModule)
          setIsEthersLoaded(true)
        }
      } catch (err) {
        console.error("Failed to load ethers:", err)
        if (mounted) {
          setError("Failed to load required libraries")
          setIsEthersLoaded(false)
          setIsLoading(false)
        }
      }
    }

    loadEthers()

    return () => {
      mounted = false
    }
  }, [])

  // Initialize with native token immediately when address and ethers are available
  useEffect(() => {
    if (address && ethers && isEthersLoaded) {
      const nativeToken = getNativeToken()
      const initialToken: DetectedToken = {
        ...nativeToken,
        balance: "0",
        isLoading: true,
      }
      setTokens([initialToken])
      setIsLoading(true)
    } else {
      setTokens([])
      setIsLoading(false)
    }
  }, [address, ethers, isEthersLoaded])

  const detectTokenBalance = useCallback(
    async (tokenAddress: string, userAddress: string): Promise<DetectedToken | null> => {
      if (!ethers || !isEthersLoaded) return null

      try {
        const provider = await getProvider()
        const tokenContract = await getTokenContract(tokenAddress, provider)

        // Get token details
        const [name, symbol, decimals, balance] = await Promise.all([
          tokenContract.name(),
          tokenContract.symbol(),
          tokenContract.decimals(),
          tokenContract.balanceOf(userAddress),
        ])

        // Only include tokens with non-zero balance
        if (balance.gt(0)) {
          return {
            symbol,
            name,
            address: tokenAddress,
            decimals,
            icon: symbol.charAt(0), // Use first letter as icon
            isNative: false,
            balance: ethers.utils.formatUnits(balance, decimals),
            isLoading: false,
          }
        }

        return null
      } catch (error) {
        console.error(`Error detecting token ${tokenAddress}:`, error)
        return null
      }
    },
    [ethers, isEthersLoaded],
  )

  const loadNativeBalance = useCallback(
    async (userAddress: string) => {
      if (!ethers || !isEthersLoaded) return

      try {
        const provider = await getProvider()
        const nativeToken = getNativeToken()
        const nativeBalance = await provider.getBalance(userAddress)

        const updatedNativeToken: DetectedToken = {
          ...nativeToken,
          balance: ethers.utils.formatEther(nativeBalance),
          isLoading: false,
        }

        setTokens((prev) => {
          const updated = [...prev]
          const nativeIndex = updated.findIndex((token) => token.isNative)
          if (nativeIndex >= 0) {
            updated[nativeIndex] = updatedNativeToken
          } else {
            updated.unshift(updatedNativeToken)
          }
          return updated
        })
      } catch (error) {
        console.error("Error loading native balance:", error)
        // Still show native token with 0 balance
        const nativeToken = getNativeToken()
        setTokens((prev) => {
          const updated = [...prev]
          const nativeIndex = updated.findIndex((token) => token.isNative)
          if (nativeIndex >= 0) {
            updated[nativeIndex] = {
              ...nativeToken,
              balance: "0",
              isLoading: false,
            }
          }
          return updated
        })
      }
    },
    [ethers, isEthersLoaded],
  )

  const scanForTokens = useCallback(
    async (userAddress: string) => {
      if (!ethers || !isEthersLoaded) return

      try {
        const provider = await getProvider()

        // Get recent transactions to find ERC20 token interactions
        const latestBlock = await provider.getBlockNumber()
        const fromBlock = Math.max(0, latestBlock - 10000) // Last ~10k blocks

        // Look for ERC20 Transfer events involving the user
        const transferTopic = ethers.utils.id("Transfer(address,address,uint256)")

        // Get logs where user is sender or receiver
        const [sentLogs, receivedLogs] = await Promise.all([
          provider.getLogs({
            fromBlock,
            toBlock: latestBlock,
            topics: [transferTopic, ethers.utils.hexZeroPad(userAddress, 32)],
          }),
          provider.getLogs({
            fromBlock,
            toBlock: latestBlock,
            topics: [transferTopic, null, ethers.utils.hexZeroPad(userAddress, 32)],
          }),
        ])

        // Combine and deduplicate token addresses
        const allLogs = [...sentLogs, ...receivedLogs]
        const tokenAddresses = new Set<string>()

        allLogs.forEach((log) => {
          if (log.address && log.address !== ethers.constants.AddressZero) {
            tokenAddresses.add(log.address)
          }
        })

        // Detect each unique token
        const tokenPromises = Array.from(tokenAddresses).map((address) => detectTokenBalance(address, userAddress))

        const tokenResults = await Promise.all(tokenPromises)

        // Add detected tokens with balance > 0
        const detectedTokens: DetectedToken[] = []
        tokenResults.forEach((token) => {
          if (token) {
            detectedTokens.push(token)
          }
        })

        // Update tokens list with detected tokens
        setTokens((prev) => {
          const nativeToken = prev.find((token) => token.isNative)
          const result = nativeToken ? [nativeToken] : []

          // Add detected tokens that aren't already in the list
          detectedTokens.forEach((newToken) => {
            const exists = result.some((existing) => existing.address.toLowerCase() === newToken.address.toLowerCase())
            if (!exists) {
              result.push(newToken)
            }
          })

          return result
        })
      } catch (err: any) {
        console.error("Error scanning for tokens:", err)
        setError(err.message || "Failed to scan for tokens")
      }
    },
    [detectTokenBalance, ethers, isEthersLoaded],
  )

  const refreshTokenBalances = useCallback(async () => {
    if (!address || tokens.length === 0 || !ethers || !isEthersLoaded) return

    const updatedTokens = await Promise.all(
      tokens.map(async (token) => {
        try {
          if (token.isNative) {
            const provider = await getProvider()
            const balance = await provider.getBalance(address)
            return {
              ...token,
              balance: ethers.utils.formatEther(balance),
              isLoading: false,
            }
          } else {
            const tokenContract = await getTokenContract(token.address)
            const balance = await tokenContract.balanceOf(address)
            return {
              ...token,
              balance: ethers.utils.formatUnits(balance, token.decimals),
              isLoading: false,
            }
          }
        } catch (error) {
          console.error(`Error refreshing balance for ${token.symbol}:`, error)
          return {
            ...token,
            isLoading: false,
          }
        }
      }),
    )

    setTokens(updatedTokens)
  }, [address, tokens, ethers, isEthersLoaded])

  const addCustomToken = useCallback(
    async (tokenAddress: string) => {
      if (!address || !ethers || !isEthersLoaded) return false

      try {
        const detectedToken = await detectTokenBalance(tokenAddress, address)
        if (detectedToken) {
          setTokens((prev) => {
            // Check if token already exists
            const exists = prev.some((token) => token.address.toLowerCase() === tokenAddress.toLowerCase())
            if (exists) return prev

            return [...prev, detectedToken]
          })
          return true
        }
        return false
      } catch (error) {
        console.error("Error adding custom token:", error)
        return false
      }
    },
    [address, detectTokenBalance, ethers, isEthersLoaded],
  )

  // Main effect to load tokens when address and ethers are available
  useEffect(() => {
    if (address && ethers && isEthersLoaded) {
      const loadTokens = async () => {
        setIsLoading(true)

        try {
          // Load native balance first
          await loadNativeBalance(address)

          // Then scan for other tokens
          await scanForTokens(address)
        } catch (err: any) {
          console.error("Error loading tokens:", err)
          setError(err.message || "Failed to load tokens")
        } finally {
          setIsLoading(false)
        }
      }

      loadTokens()
    } else {
      setTokens([])
      setError(null)
      setIsLoading(false)
    }
  }, [address, ethers, isEthersLoaded, loadNativeBalance, scanForTokens])

  return {
    tokens,
    isLoading,
    error,
    refreshTokenBalances,
    addCustomToken,
    scanForTokens: () => (address && ethers && isEthersLoaded ? scanForTokens(address) : Promise.resolve()),
    isEthersLoaded,
  }
}
