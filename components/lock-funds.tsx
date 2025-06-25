"use client"

import { useState } from "react"
import { useAccount, useContract, useSigner } from "wagmi"
import { ethers } from "ethers"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useHistory } from "@/hooks/use-history"

// Replace with your contract ABI and address
import LockableToken from "../abi/LockableToken.json"
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""

interface Token {
  address: string
  symbol: string
  name: string
  decimals?: number
}

const LockFunds = () => {
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const [amount, setAmount] = useState("")
  const [secret, setSecret] = useState("")
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const { addHistoryEntry } = useHistory()

  const contract = useContract({
    address: contractAddress,
    abi: LockableToken.abi,
    signerOrProvider: signer,
  })

  const handleLockFunds = async () => {
    if (!address || !signer || !amount || !secret || !selectedToken) {
      toast.error("Please connect your wallet and fill in all fields.")
      return
    }

    try {
      const amountInWei = ethers.utils.parseUnits(amount, selectedToken.decimals || 18)
      const secretHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(secret))

      // Approve the contract to spend tokens
      const tokenContract = new ethers.Contract(
        selectedToken.address,
        ["function approve(address spender, uint256 amount) external returns (bool)"],
        signer,
      )

      const approvalTx = await tokenContract.approve(contractAddress, amountInWei.toString())
      await approvalTx.wait()

      // Call the lock function
      const tx = await contract.lock(selectedToken.address, amountInWei.toString(), secretHash)

      const receipt = await tx.wait()

      if (receipt.status === 1) {
        toast.success("Funds locked successfully!")
        setAmount("")
        setSecret("")
        setSelectedToken(null)

        // Add to history
        await addHistoryEntry({
          type: "lock",
          amount: amount,
          token: {
            address: selectedToken.address,
            symbol: selectedToken.symbol,
            name: selectedToken.name,
            decimals: selectedToken.decimals || 18,
          },
          hash: secretHash,
          txHash: tx.hash,
          blockNumber: receipt.blockNumber,
          status: "completed",
          gasUsed: receipt.gasUsed?.toString(),
          gasPrice: tx.gasPrice?.toString(),
        })
      } else {
        toast.error("Transaction failed.")
      }
    } catch (error: any) {
      console.error("Error locking funds:", error)
      toast.error(error.message || "An error occurred while locking funds.")
    }
  }

  return (
    <div>
      <h2>Lock Funds</h2>
      {/* Token Selection */}
      <div>
        <label>Token Address:</label>
        <input
          type="text"
          value={selectedToken?.address || ""}
          onChange={(e) => setSelectedToken({ ...selectedToken, address: e.target.value })}
          placeholder="Token Address"
        />
      </div>
      <div>
        <label>Token Symbol:</label>
        <input
          type="text"
          value={selectedToken?.symbol || ""}
          onChange={(e) => setSelectedToken({ ...selectedToken, symbol: e.target.value })}
          placeholder="Token Symbol"
        />
      </div>
      <div>
        <label>Token Name:</label>
        <input
          type="text"
          value={selectedToken?.name || ""}
          onChange={(e) => setSelectedToken({ ...selectedToken, name: e.target.value })}
          placeholder="Token Name"
        />
      </div>
      <div>
        <label>Token Decimals:</label>
        <input
          type="number"
          value={selectedToken?.decimals || ""}
          onChange={(e) => setSelectedToken({ ...selectedToken, decimals: Number.parseInt(e.target.value) })}
          placeholder="Token Decimals"
        />
      </div>

      {/* Amount Input */}
      <div>
        <label>Amount:</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
      </div>

      {/* Secret Input */}
      <div>
        <label>Secret:</label>
        <input type="text" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Secret" />
      </div>

      {/* Lock Button */}
      <button onClick={handleLockFunds}>Lock Funds</button>
    </div>
  )
}

export default LockFunds
