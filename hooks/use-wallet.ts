"use client"

import { useState, useEffect, useCallback } from "react"
import { getCurrentBlockchainConfig, getBlockchainByChainId } from "@/lib/blockchain-config"

interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  chainId: number | null
  isCorrectNetwork: boolean
  networkName: string | null
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    isCorrectNetwork: false,
    networkName: null,
  })
  const [isConnecting, setIsConnecting] = useState(false)
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
        }
      }
    }

    loadEthers()

    return () => {
      mounted = false
    }
  }, [])

  // Check if MetaMask is available
  const isMetaMaskAvailable = useCallback(() => {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  }, [])

  // Request account access
  const requestAccounts = useCallback(async (): Promise<string[]> => {
    if (!isMetaMaskAvailable()) {
      throw new Error("MetaMask not available")
    }
    return await window.ethereum!.request({ method: "eth_requestAccounts" })
  }, [isMetaMaskAvailable])

  // Switch to specific blockchain network
  const switchToNetwork = useCallback(
    async (chainId: number): Promise<void> => {
      if (!isMetaMaskAvailable()) {
        throw new Error("MetaMask not available")
      }

      const config = getBlockchainByChainId(chainId)
      if (!config) {
        throw new Error("Unsupported network")
      }

      try {
        await window.ethereum!.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        })
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum!.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${chainId.toString(16)}`,
                  chainName: config.name,
                  nativeCurrency: config.nativeCurrency,
                  rpcUrls: [config.rpcUrl],
                  blockExplorerUrls: [config.blockExplorerUrl],
                },
              ],
            })
          } catch (addError) {
            throw new Error(`Failed to add ${config.name} network`)
          }
        } else {
          throw new Error(`Failed to switch to ${config.name} network`)
        }
      }
    },
    [isMetaMaskAvailable],
  )

  // Switch to current blockchain
  const switchToCurrentNetwork = useCallback(async (): Promise<void> => {
    const config = getCurrentBlockchainConfig()
    return switchToNetwork(config.chainId)
  }, [switchToNetwork])

  const updateWalletState = useCallback(async () => {
    if (!isMetaMaskAvailable() || !ethers || !isEthersLoaded) {
      return
    }

    try {
      // Check if ethers.providers exists
      if (!ethers.providers || !ethers.providers.Web3Provider) {
        console.error("ethers.providers.Web3Provider is not available")
        setError("Ethers library not properly loaded")
        return
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
      if (!provider) {
        setError("Failed to create Web3 provider")
        return
      }

      const accounts = await provider.listAccounts()
      if (accounts.length === 0) {
        setWallet({
          isConnected: false,
          address: null,
          balance: null,
          chainId: null,
          isCorrectNetwork: false,
          networkName: null,
        })
        return
      }

      const address = accounts[0]
      const balance = await provider.getBalance(address)
      const network = await provider.getNetwork()
      const chainId = network.chainId

      const currentConfig = getCurrentBlockchainConfig()
      const isCorrectNetwork = chainId === currentConfig.chainId
      const networkConfig = getBlockchainByChainId(chainId)

      // Check if ethers.utils exists
      if (!ethers.utils || !ethers.utils.formatEther) {
        console.error("ethers.utils.formatEther is not available")
        setError("Ethers utilities not properly loaded")
        return
      }

      setWallet({
        isConnected: true,
        address,
        balance: ethers.utils.formatEther(balance),
        chainId,
        isCorrectNetwork,
        networkName: networkConfig?.name || "Unknown Network",
      })

      // Clear any previous errors
      setError(null)
    } catch (err: any) {
      console.error("Error updating wallet state:", err)
      setError(err.message || "Failed to update wallet state")
    }
  }, [ethers, isEthersLoaded, isMetaMaskAvailable])

  const connectWallet = useCallback(async () => {
    if (!isMetaMaskAvailable()) {
      setError("MetaMask not available. Please install MetaMask.")
      return false
    }

    if (!ethers || !isEthersLoaded) {
      setError("Required libraries not loaded. Please refresh the page.")
      return false
    }

    setIsConnecting(true)
    setError(null)

    try {
      await requestAccounts()
      await switchToCurrentNetwork()
      await updateWalletState()
      setIsConnecting(false)
      return true
    } catch (err: any) {
      console.error("Error connecting wallet:", err)
      setError(err.message || "Failed to connect wallet")
      setIsConnecting(false)
      return false
    }
  }, [updateWalletState, ethers, isEthersLoaded, isMetaMaskAvailable, requestAccounts, switchToCurrentNetwork])

  const disconnectWallet = useCallback(() => {
    setWallet({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
      isCorrectNetwork: false,
      networkName: null,
    })
    setError(null)
  }, [])

  const switchNetwork = useCallback(async () => {
    try {
      await switchToCurrentNetwork()
      await updateWalletState()
      return true
    } catch (err: any) {
      setError(err.message || "Failed to switch network")
      return false
    }
  }, [updateWalletState, switchToCurrentNetwork])

  const getSigner = useCallback(() => {
    if (!wallet.isConnected || !isMetaMaskAvailable() || !ethers || !isEthersLoaded) {
      return null
    }

    try {
      // Check if ethers.providers exists
      if (!ethers.providers || !ethers.providers.Web3Provider) {
        console.error("ethers.providers.Web3Provider is not available")
        return null
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
      return provider?.getSigner() || null
    } catch (err) {
      console.error("Error getting signer:", err)
      return null
    }
  }, [wallet.isConnected, ethers, isEthersLoaded, isMetaMaskAvailable])

  // Set up event listeners only after ethers is loaded
  useEffect(() => {
    if (!isMetaMaskAvailable() || !ethers || !isEthersLoaded) {
      return
    }

    // Initial wallet state update
    updateWalletState()

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        updateWalletState()
      }
    }

    // Listen for chain changes
    const handleChainChanged = () => {
      updateWalletState()
    }

    window.ethereum!.on("accountsChanged", handleAccountsChanged)
    window.ethereum!.on("chainChanged", handleChainChanged)

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [updateWalletState, disconnectWallet, ethers, isEthersLoaded, isMetaMaskAvailable])

  return {
    wallet,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getSigner,
    refreshWallet: updateWalletState,
    isEthersLoaded,
  }
}
