"use client"

import { useState, useEffect, useCallback } from "react"
import { getProvider, getTokenContract } from "@/lib/contract-utils"
import { getNativeToken } from "@/lib/blockchain-config"
import TokenCacheManager, { type CachedToken } from "@/lib/token-cache"
import type { TokenConfig } from "@/lib/blockchain-config"

interface DetectedToken extends TokenConfig {
  balance: string
  isLoading: boolean
}

export function useTokenDetection(address: string | null) {
  const [tokens, setTokens] = useState<DetectedToken[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ethers, setEthers] = useState<any>(null)
  const [isEthersLoaded, setIsEthersLoaded] = useState(false)

  const cacheManager = TokenCacheManager.getInstance()

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
        }
      }
    }

    loadEthers()

    return () => {
      mounted = false
    }
  }, [])

  // Convert cached token to detected token
  const cachedToDetected = useCallback(
    (cached: CachedToken): DetectedToken => ({
      symbol: cached.symbol,
      name: cached.name,
      address: cached.address,
      decimals: cached.decimals,
      icon: cached.icon,
      isNative: cached.isNative,
      balance: cached.balance,
      isLoading: false,
    }),
    [],
  )

  // Load tokens from cache first, then refresh if needed
  useEffect(() => {
    if (address && ethers && isEthersLoaded) {
      // Check cache first
      const cachedTokens = cacheManager.getCachedTokens(address)

      if (cachedTokens.length > 0) {
        // Load from cache immediately
        const detectedTokens = cachedTokens.map(cachedToDetected)
        setTokens(detectedTokens)
        setIsLoading(false)

        // Check if cache is still valid
        if (cacheManager.isCacheValid(address)) {
          return // Use cache, no need to refresh
        }
      } else {
        // No cache, show loading with native token
        const nativeToken = getNativeToken()
        setTokens([
          {
            ...nativeToken,
            balance: "0",
            isLoading: true,
          },
        ])
        setIsLoading(true)
      }

      // Refresh tokens in background
      loadTokensFromBlockchain(address)
    } else {
      setTokens([])
      setIsLoading(false)
    }
  }, [address, ethers, isEthersLoaded, cachedToDetected])

  const detectTokenBalance = useCallback(
    async (tokenAddress: string, userAddress: string): Promise<DetectedToken | null> => {
      if (!ethers || !isEthersLoaded) return null

      try {
        // Check cache first for contract info
        const cachedInfo = cacheManager.getCachedTokenInfo(tokenAddress)

        let name: string, symbol: string, decimals: number

        if (cachedInfo) {
          name = cachedInfo.name
          symbol = cachedInfo.symbol
          decimals = cachedInfo.decimals
        } else {
          // Fetch from contract
          const provider = await getProvider()
          const tokenContract = await getTokenContract(tokenAddress, provider)

          const [contractName, contractSymbol, contractDecimals] = await Promise.all([
            tokenContract.name(),
            tokenContract.symbol(),
            tokenContract.decimals(),
          ])

          name = contractName
          symbol = contractSymbol
          decimals = contractDecimals
        }

        // Always fetch fresh balance
        const provider = await getProvider()
        const tokenContract = await getTokenContract(tokenAddress, provider)
        const balance = await tokenContract.balanceOf(userAddress)

        // Only include tokens with non-zero balance
        if (balance.gt(0)) {
          return {
            symbol,
            name,
            address: tokenAddress,
            decimals,
            icon: symbol.charAt(0),
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
    [ethers, isEthersLoaded, cacheManager],
  )

  const loadNativeBalance = useCallback(
    async (userAddress: string): Promise<DetectedToken> => {
      if (!ethers || !isEthersLoaded) {
        const nativeToken = getNativeToken()
        return {
          ...nativeToken,
          balance: "0",
          isLoading: true,
        }
      }

      try {
        const provider = await getProvider()
        const nativeToken = getNativeToken()
        const nativeBalance = await provider.getBalance(userAddress)

        return {
          ...nativeToken,
          balance: ethers.utils.formatEther(nativeBalance),
          isLoading: false,
        }
      } catch (error) {
        console.error("Error loading native balance:", error)
        const nativeToken = getNativeToken()
        return {
          ...nativeToken,
          balance: "0",
          isLoading: false,
        }
      }
    },
    [ethers, isEthersLoaded],
  )

  const scanForTokens = useCallback(
    async (userAddress: string): Promise<DetectedToken[]> => {
      if (!ethers || !isEthersLoaded) return []

      try {
        const provider = await getProvider()
        const latestBlock = await provider.getBlockNumber()
        const fromBlock = Math.max(0, latestBlock - 10000)

        const transferTopic = ethers.utils.id("Transfer(address,address,uint256)")

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

        const allLogs = [...sentLogs, ...receivedLogs]
        const tokenAddresses = new Set<string>()

        allLogs.forEach((log) => {
          if (log.address && log.address !== ethers.constants.AddressZero) {
            tokenAddresses.add(log.address)
          }
        })

        const tokenPromises = Array.from(tokenAddresses).map((address) => detectTokenBalance(address, userAddress))

        const tokenResults = await Promise.all(tokenPromises)
        return tokenResults.filter((token): token is DetectedToken => token !== null)
      } catch (err: any) {
        console.error("Error scanning for tokens:", err)
        setError(err.message || "Failed to scan for tokens")
        return []
      }
    },
    [detectTokenBalance, ethers, isEthersLoaded],
  )

  const loadTokensFromBlockchain = useCallback(
    async (userAddress: string) => {
      if (!ethers || !isEthersLoaded) return

      try {
        setIsLoading(true)
        setError(null)

        // Load native token
        const nativeToken = await loadNativeBalance(userAddress)

        // Scan for other tokens
        const otherTokens = await scanForTokens(userAddress)

        const allTokens = [nativeToken, ...otherTokens]
        setTokens(allTokens)

        // Cache the results
        const cachedTokens: CachedToken[] = allTokens.map((token) => ({
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          balance: token.balance,
          lastUpdated: Date.now(),
          icon: token.icon,
          isNative: token.isNative,
        }))

        cacheManager.cacheTokens(userAddress, cachedTokens)
      } catch (err: any) {
        console.error("Error loading tokens:", err)
        setError(err.message || "Failed to load tokens")
      } finally {
        setIsLoading(false)
      }
    },
    [ethers, isEthersLoaded, loadNativeBalance, scanForTokens, cacheManager],
  )

  const refreshTokenBalances = useCallback(async () => {
    if (!address || !ethers || !isEthersLoaded) return

    // Clear cache and reload
    cacheManager.clearUserCache(address)
    await loadTokensFromBlockchain(address)
  }, [address, ethers, isEthersLoaded, cacheManager, loadTokensFromBlockchain])

  const addCustomToken = useCallback(
    async (tokenAddress: string) => {
      if (!address || !ethers || !isEthersLoaded) return false

      try {
        const detectedToken = await detectTokenBalance(tokenAddress, address)
        if (detectedToken) {
          setTokens((prev) => {
            const exists = prev.some((token) => token.address.toLowerCase() === tokenAddress.toLowerCase())
            if (exists) return prev

            const updated = [...prev, detectedToken]

            // Update cache
            const cachedToken: CachedToken = {
              address: detectedToken.address,
              name: detectedToken.name,
              symbol: detectedToken.symbol,
              decimals: detectedToken.decimals,
              balance: detectedToken.balance,
              lastUpdated: Date.now(),
              icon: detectedToken.icon,
              isNative: detectedToken.isNative,
            }
            cacheManager.updateToken(address, cachedToken)

            return updated
          })
          return true
        }
        return false
      } catch (error) {
        console.error("Error adding custom token:", error)
        return false
      }
    },
    [address, detectTokenBalance, ethers, isEthersLoaded, cacheManager],
  )

  return {
    tokens,
    isLoading,
    error,
    refreshTokenBalances,
    addCustomToken,
    scanForTokens: () => (address && ethers && isEthersLoaded ? loadTokensFromBlockchain(address) : Promise.resolve()),
    isEthersLoaded,
  }
}
