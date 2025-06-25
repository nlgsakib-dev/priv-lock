"use client"

import type React from "react"

import { useState } from "react"
import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi"
import { Button, Input, Text } from "@chakra-ui/react"
import { ethers } from "ethers"
import { useHistory } from "@/hooks/use-history"

interface UnlockFundsProps {
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  tokenDecimals: number | undefined
  contractAddress: string
  abi: any
}

const UnlockFunds: React.FC<UnlockFundsProps> = ({
  tokenAddress,
  tokenSymbol,
  tokenName,
  tokenDecimals,
  contractAddress,
  abi,
}) => {
  const { address } = useAccount()
  const [secret, setSecret] = useState("")
  const [lockedAmount, setLockedAmount] = useState<number>(0)
  const { addHistoryEntry } = useHistory()

  const { write, data, isLoading, isError, error } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: abi,
    functionName: "unlockFunds",
    onSuccess(data) {
      console.log("Success", data)
    },
  })

  const { isSuccess, receipt } = useWaitForTransaction({
    hash: data?.hash,
  })

  const handleUnlockFunds = async () => {
    if (!secret || !lockedAmount) {
      alert("Please enter the secret and locked amount.")
      return
    }

    try {
      const amount = ethers.utils.parseUnits(lockedAmount.toString(), tokenDecimals || 18)
      const tx = await write({
        args: [address, amount, secret],
      })

      if (isSuccess && receipt) {
        // Add to history
        await addHistoryEntry({
          type: "unlock",
          amount: lockedAmount,
          token: {
            address: tokenAddress,
            symbol: tokenSymbol,
            name: tokenName,
            decimals: tokenDecimals || 18,
          },
          hash: secret,
          txHash: tx.hash,
          blockNumber: receipt.blockNumber,
          status: "completed",
          gasUsed: receipt.gasUsed?.toString(),
          gasPrice: tx.gasPrice?.toString(),
        })
      }
    } catch (err: any) {
      console.error("Error unlocking funds:", err)
      alert(`Error unlocking funds: ${err.message}`)
    }
  }

  return (
    <div>
      <Text>Unlock Funds</Text>
      <Input placeholder="Secret" value={secret} onChange={(e) => setSecret(e.target.value)} />
      <Input
        placeholder="Locked Amount"
        type="number"
        value={lockedAmount}
        onChange={(e) => setLockedAmount(Number(e.target.value))}
      />
      <Button onClick={handleUnlockFunds} isLoading={isLoading}>
        Unlock
      </Button>

      {isSuccess && receipt && <Text>Transaction successful! Block number: {receipt.blockNumber}</Text>}

      {isError && <Text color="red">Error unlocking funds: {error?.message}</Text>}
    </div>
  )
}

export default UnlockFunds
