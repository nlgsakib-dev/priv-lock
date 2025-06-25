"use client"

import { ethers } from "ethers"

// EIP-712 domain for signing
const DOMAIN = {
  name: "Mixion Locker",
  version: "1",
  chainId: 1, // Will be updated dynamically
  verifyingContract: "0x0000000000000000000000000000000000000000",
}

// Types for EIP-712 signing
const TYPES = {
  HistoryAccess: [
    { name: "action", type: "string" },
    { name: "timestamp", type: "uint256" },
    { name: "nonce", type: "string" },
  ],
}

export interface HistoryEntry {
  id: string
  type: "lock" | "unlock"
  amount: string
  token: {
    symbol: string
    name: string
    address: string
    decimals: number
  }
  hash: string
  txHash?: string
  timestamp: number
  status: "pending" | "completed" | "failed"
  blockNumber?: number
}

class EncryptedStorage {
  private static instance: EncryptedStorage
  private encryptionKey: string | null = null
  private userAddress: string | null = null

  static getInstance(): EncryptedStorage {
    if (!EncryptedStorage.instance) {
      EncryptedStorage.instance = new EncryptedStorage()
    }
    return EncryptedStorage.instance
  }

  // Generate encryption key from user signature
  async generateEncryptionKey(signer: any, address: string): Promise<string> {
    try {
      const timestamp = Math.floor(Date.now() / 1000)
      const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(16))

      const message = {
        action: "unlock_history",
        timestamp,
        nonce,
      }

      // Update domain with current chain ID
      const network = await signer.provider.getNetwork()
      const domain = { ...DOMAIN, chainId: network.chainId }

      const signature = await signer._signTypedData(domain, TYPES, message)

      // Use signature as encryption key
      const key = ethers.utils.keccak256(signature)
      this.encryptionKey = key
      this.userAddress = address.toLowerCase()

      return key
    } catch (error) {
      console.error("Error generating encryption key:", error)
      throw new Error("Failed to generate encryption key")
    }
  }

  // Encrypt data using AES-like encryption (simplified for demo)
  private encrypt(data: string, key: string): string {
    try {
      // Simple XOR encryption for demo (in production, use proper AES)
      const keyBytes = ethers.utils.arrayify(key)
      const dataBytes = ethers.utils.toUtf8Bytes(data)
      const encrypted = new Uint8Array(dataBytes.length)

      for (let i = 0; i < dataBytes.length; i++) {
        encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length]
      }

      return ethers.utils.hexlify(encrypted)
    } catch (error) {
      console.error("Encryption error:", error)
      throw new Error("Failed to encrypt data")
    }
  }

  // Decrypt data
  private decrypt(encryptedData: string, key: string): string {
    try {
      const keyBytes = ethers.utils.arrayify(key)
      const encryptedBytes = ethers.utils.arrayify(encryptedData)
      const decrypted = new Uint8Array(encryptedBytes.length)

      for (let i = 0; i < encryptedBytes.length; i++) {
        decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length]
      }

      return ethers.utils.toUtf8String(decrypted)
    } catch (error) {
      console.error("Decryption error:", error)
      throw new Error("Failed to decrypt data")
    }
  }

  // Store encrypted history
  async storeHistory(entries: HistoryEntry[], signer: any, address: string): Promise<void> {
    try {
      if (!this.encryptionKey || this.userAddress !== address.toLowerCase()) {
        await this.generateEncryptionKey(signer, address)
      }

      const data = JSON.stringify(entries)
      const encrypted = this.encrypt(data, this.encryptionKey!)

      const storageKey = `mixion_history_${address.toLowerCase()}`
      localStorage.setItem(storageKey, encrypted)
    } catch (error) {
      console.error("Error storing history:", error)
      throw error
    }
  }

  // Retrieve and decrypt history
  async getHistory(signer: any, address: string): Promise<HistoryEntry[]> {
    try {
      const storageKey = `mixion_history_${address.toLowerCase()}`
      const encrypted = localStorage.getItem(storageKey)

      if (!encrypted) {
        return []
      }

      if (!this.encryptionKey || this.userAddress !== address.toLowerCase()) {
        await this.generateEncryptionKey(signer, address)
      }

      const decrypted = this.decrypt(encrypted, this.encryptionKey!)
      return JSON.parse(decrypted)
    } catch (error) {
      console.error("Error retrieving history:", error)
      // If decryption fails, return empty array (corrupted or wrong signature)
      return []
    }
  }

  // Add new history entry
  async addHistoryEntry(entry: HistoryEntry, signer: any, address: string): Promise<void> {
    try {
      const currentHistory = await this.getHistory(signer, address)
      const updatedHistory = [entry, ...currentHistory].slice(0, 100) // Keep last 100 entries
      await this.storeHistory(updatedHistory, signer, address)
    } catch (error) {
      console.error("Error adding history entry:", error)
      throw error
    }
  }

  // Update history entry
  async updateHistoryEntry(
    entryId: string,
    updates: Partial<HistoryEntry>,
    signer: any,
    address: string,
  ): Promise<void> {
    try {
      const currentHistory = await this.getHistory(signer, address)
      const updatedHistory = currentHistory.map((entry) => (entry.id === entryId ? { ...entry, ...updates } : entry))
      await this.storeHistory(updatedHistory, signer, address)
    } catch (error) {
      console.error("Error updating history entry:", error)
      throw error
    }
  }

  // Clear history
  async clearHistory(address: string): Promise<void> {
    const storageKey = `mixion_history_${address.toLowerCase()}`
    localStorage.removeItem(storageKey)
    this.encryptionKey = null
    this.userAddress = null
  }
}

export default EncryptedStorage
