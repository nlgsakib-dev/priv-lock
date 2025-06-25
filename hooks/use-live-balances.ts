"use client"

import { useState, useEffect, useCallback } from "react"
import { getWebSocketProvider, getNativeBalance, getTokenBalance } from "@/lib/contract-utils"
import { getCurrentTokens } from "@/lib/blockchain-config"

interface TokenBalance {
  symbol: string
  balance: string
  usdValue?: string
  isLoading: boolean
}

interface LiveBalancesState {
  balances: Record<string, TokenBalance>
  isConnected: boolean
  error: string | null
}

export function useLiveBalances(address: string | null) {
  const [state, setState] = useState<LiveBalancesState>({
    balances: {},
    isConnected: false,
    error: null,
  })
  const [ethers, setEthers] = useState<any>(null)

  // Load ethers dynamically
  useEffect(() => {
    const loadEthers = async () => {
      try {
        const ethersModule = await import("ethers")
        setEthers(ethersModule)
      } catch (err) {
        console.error("Failed to load ethers:", err)
        setState((prev) => ({ ...prev, error: "Failed to load required libraries" }))
      }
    }
    loadEthers()
  }, [])

  const updateBalance = useCallback(
    async (tokenSymbol: string, tokenAddress: string, isNative: boolean) => {
      if (!address || !ethers) return

      setState((prev) => ({
        ...prev,
        balances: {
          ...prev.balances,
          [tokenSymbol]: {
            ...prev.balances[tokenSymbol],
            isLoading: true,
          },
        },
      }))

      try {
        let balance: any
        if (isNative) {
          balance = await getNativeBalance(address)
        } else {
          balance = await getTokenBalance(tokenAddress, address)
        }

        const tokens = getCurrentTokens()
        const token = tokens[tokenSymbol]
        const formattedBalance = ethers.utils.formatUnits(balance, token?.decimals || 18)

        setState((prev) => ({
          ...prev,
          balances: {
            ...prev.balances,
            [tokenSymbol]: {
              symbol: tokenSymbol,
              balance: formattedBalance,
              isLoading: false,
            },
          },
        }))
      } catch (error: any) {
        console.error(`Error updating balance for ${tokenSymbol}:`, error)
        setState((prev) => ({
          ...prev,
          balances: {
            ...prev.balances,
            [tokenSymbol]: {
              symbol: tokenSymbol,
              balance: "0",
              isLoading: false,
            },
          },
          error: error.message,
        }))
      }
    },
    [address, ethers],
  )

  const updateAllBalances = useCallback(async () => {
    if (!address || !ethers) return

    const tokens = getCurrentTokens()
    const updatePromises = Object.entries(tokens).map(([symbol, token]) =>
      updateBalance(symbol, token.address, token.isNative),
    )

    await Promise.all(updatePromises)
  }, [address, updateBalance, ethers])

  useEffect(() => {
    if (!address || !ethers) {
      setState({
        balances: {},
        isConnected: false,
        error: null,
      })
      return
    }

    // Initial balance fetch
    updateAllBalances()

    // Set up WebSocket connection for live updates
    const setupWebSocket = async () => {
      const wsProvider = await getWebSocketProvider()
      if (!wsProvider) {
        console.warn("WebSocket provider not available, falling back to polling")
        // Fallback to polling every 30 seconds
        const interval = setInterval(updateAllBalances, 30000)
        return () => clearInterval(interval)
      }

      setState((prev) => ({ ...prev, isConnected: true }))

      // Listen for new blocks to update balances
      const handleNewBlock = () => {
        updateAllBalances()
      }

      wsProvider.on("block", handleNewBlock)

      // Listen for specific transfer events
      const tokens = getCurrentTokens()
      Object.entries(tokens).forEach(([symbol, token]) => {
        if (!token.isNative) {
          const tokenContract = new ethers.Contract(
            token.address,
            ["event Transfer(address indexed from, address indexed to, uint256 value)"],
            wsProvider,
          )

          // Listen for transfers to/from user address
          const filterTo = tokenContract.filters.Transfer(null, address)
          const filterFrom = tokenContract.filters.Transfer(address, null)

          tokenContract.on(filterTo, () => updateBalance(symbol, token.address, false))
          tokenContract.on(filterFrom, () => updateBalance(symbol, token.address, false))
        }
      })

      return () => {
        wsProvider.removeAllListeners()
        wsProvider.destroy()
        setState((prev) => ({ ...prev, isConnected: false }))
      }
    }

    setupWebSocket()
  }, [address, updateAllBalances, updateBalance, ethers])

  return {
    ...state,
    refreshBalances: updateAllBalances,
  }
}
