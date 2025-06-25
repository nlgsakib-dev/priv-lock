"use client"

import { useState, useCallback, useEffect } from "react"
import {
  getContract,
  getTokenContract,
  generateSecret,
  computeNullifier,
  computeCommitment,
  parseAmount,
  formatAmount,
  waitForTransaction,
  getTokenDetails,
} from "@/lib/contract-utils"
import { getNativeToken } from "@/lib/blockchain-config"
import type { TokenConfig } from "@/lib/blockchain-config"

interface LockFundsParams {
  amount: string
  token: TokenConfig
  signer: any
}

interface UnlockFundsParams {
  secret: string
  signer: any
}

interface SecretDetails {
  amount: string
  tokenAddress: string
  tokenSymbol: string
  isNative: boolean
  isUsed: boolean
}

export function useContract() {
  const [isLoading, setIsLoading] = useState(false)
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

  const lockFunds = useCallback(
    async ({ amount, token, signer }: LockFundsParams) => {
      if (!ethers || !isEthersLoaded) {
        setError("Required libraries not loaded")
        return { success: false, error: "Required libraries not loaded" }
      }

      setIsLoading(true)
      setError(null)

      try {
        // Generate secret and compute commitment
        const secret = await generateSecret()
        const nullifier = await computeNullifier(secret)
        const commitment = await computeCommitment(nullifier)

        const contract = await getContract(signer)
        const parsedAmount = await parseAmount(amount, token.decimals)

        let tx: any

        if (token.isNative) {
          // Lock native token
          tx = await contract.lockNative(commitment, { value: parsedAmount })
        } else {
          // Lock ERC20 token
          const tokenContract = await getTokenContract(token.address, signer)

          // Check allowance
          const userAddress = await signer.getAddress()
          const allowance = await tokenContract.allowance(userAddress, contract.address)

          if (allowance.lt(parsedAmount)) {
            // Need approval first
            const approveTx = await tokenContract.approve(contract.address, parsedAmount)
            await waitForTransaction(approveTx.hash)
          }

          tx = await contract.lockERC20(commitment, token.address, parsedAmount)
        }

        const receipt = await waitForTransaction(tx.hash)

        setIsLoading(false)
        return {
          success: true,
          secret,
          commitment,
          nullifier,
          txHash: receipt.transactionHash,
          amount,
          tokenSymbol: token.symbol,
        }
      } catch (err: any) {
        console.error("Error locking funds:", err)
        setError(err.message || "Failed to lock funds")
        setIsLoading(false)
        return { success: false, error: err.message || "Failed to lock funds" }
      }
    },
    [ethers, isEthersLoaded],
  )

  const unlockFunds = useCallback(
    async ({ secret, signer }: UnlockFundsParams) => {
      if (!ethers || !isEthersLoaded) {
        setError("Required libraries not loaded")
        return { success: false, error: "Required libraries not loaded" }
      }

      setIsLoading(true)
      setError(null)

      try {
        const nullifier = await computeNullifier(secret)
        const commitment = await computeCommitment(nullifier)

        const contract = await getContract(signer)

        // Check if nullifier is already used
        const isUsed = await contract.isNullifierUsed(nullifier)
        if (isUsed) {
          throw new Error("This secret has already been used")
        }

        // Get locked details
        const [lockedAmount, tokenAddress] = await contract.getLockedDetails(commitment)
        if (lockedAmount.eq(0)) {
          throw new Error("No funds found for this secret")
        }

        // Determine token info
        const isNative = tokenAddress === ethers.constants.AddressZero
        let tokenSymbol = "UNKNOWN"
        let decimals = 18

        if (isNative) {
          const nativeToken = getNativeToken()
          tokenSymbol = nativeToken.symbol
          decimals = nativeToken.decimals
        } else {
          // Get token details from contract
          const tokenDetails = await getTokenDetails(tokenAddress)
          if (tokenDetails) {
            tokenSymbol = tokenDetails.symbol
            decimals = tokenDetails.decimals
          }
        }

        const tx = await contract.withdraw(nullifier)
        const receipt = await waitForTransaction(tx.hash)

        setIsLoading(false)
        return {
          success: true,
          txHash: receipt.transactionHash,
          amount: await formatAmount(lockedAmount.toString(), decimals),
          tokenSymbol,
          isNative,
        }
      } catch (err: any) {
        console.error("Error unlocking funds:", err)
        setError(err.message || "Failed to unlock funds")
        setIsLoading(false)
        return { success: false, error: err.message || "Failed to unlock funds" }
      }
    },
    [ethers, isEthersLoaded],
  )

  const getSecretDetails = useCallback(
    async (secret: string): Promise<SecretDetails | null> => {
      if (!ethers || !isEthersLoaded) return null

      try {
        const nullifier = await computeNullifier(secret)
        const commitment = await computeCommitment(nullifier)

        const contract = await getContract()

        // Check if nullifier is used
        const isUsed = await contract.isNullifierUsed(nullifier)

        // Get locked details
        const [lockedAmount, tokenAddress] = await contract.getLockedDetails(commitment)

        if (lockedAmount.eq(0) && !isUsed) {
          return null // No funds found
        }

        const isNative = tokenAddress === ethers.constants.AddressZero
        let tokenSymbol = "UNKNOWN"
        let decimals = 18

        if (isNative) {
          const nativeToken = getNativeToken()
          tokenSymbol = nativeToken.symbol
          decimals = nativeToken.decimals
        } else {
          // Get token details from contract
          const tokenDetails = await getTokenDetails(tokenAddress)
          if (tokenDetails) {
            tokenSymbol = tokenDetails.symbol
            decimals = tokenDetails.decimals
          }
        }

        return {
          amount: await formatAmount(lockedAmount.toString(), decimals),
          tokenAddress,
          tokenSymbol,
          isNative,
          isUsed,
        }
      } catch (err: any) {
        console.error("Error getting secret details:", err)
        return null
      }
    },
    [ethers, isEthersLoaded],
  )

  const checkTokenAllowance = useCallback(
    async (tokenAddress: string, userAddress: string, amount: string, decimals = 18): Promise<boolean> => {
      if (!ethers || !isEthersLoaded) return false

      try {
        const tokenContract = await getTokenContract(tokenAddress)
        const contract = await getContract()

        const allowance = await tokenContract.allowance(userAddress, contract.address)
        const requiredAmount = await parseAmount(amount, decimals)

        return allowance.gte(requiredAmount)
      } catch (err: any) {
        console.error("Error checking allowance:", err)
        return false
      }
    },
    [ethers, isEthersLoaded],
  )

  const approveToken = useCallback(
    async (tokenAddress: string, amount: string, decimals = 18, signer: any): Promise<boolean> => {
      if (!ethers || !isEthersLoaded) return false

      try {
        const tokenContract = await getTokenContract(tokenAddress, signer)
        const contract = await getContract()
        const parsedAmount = await parseAmount(amount, decimals)

        const tx = await tokenContract.approve(contract.address, parsedAmount)
        await waitForTransaction(tx.hash)

        return true
      } catch (err: any) {
        console.error("Error approving token:", err)
        setError(err.message || "Failed to approve token")
        return false
      }
    },
    [ethers, isEthersLoaded],
  )

  return {
    lockFunds,
    unlockFunds,
    getSecretDetails,
    checkTokenAllowance,
    approveToken,
    isLoading,
    error,
    clearError: () => setError(null),
    isEthersLoaded,
  }
}
