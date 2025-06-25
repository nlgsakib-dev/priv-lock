"use client"

import CryptoJS from "crypto-js"

export interface HistoryEntry {
  id: string
  type: "lock" | "unlock"
  amount: string
  token: {
    address: string
    symbol: string
    name: string
    decimals: number
  }
  hash: string
  txHash?: string
  blockNumber?: number
  status: "pending" | "completed" | "failed"
  timestamp: number
  gasUsed?: string
  gasPrice?: string
}

class EncryptedStorage {
  private static instance: EncryptedStorage
  private readonly STORAGE_PREFIX = "mixion_encrypted_"
  private readonly SIGNATURE_MESSAGE = {
    domain: {
      name: "Mixion Locker",
      version: "1",
      chainId: 1,
    },
    types: {
      HistoryAccess: [
        { name: "action", type: "string" },
        { name: "timestamp", type: "uint256" },
        { name: "address", type: "address" },
      ],
    },
    primaryType: "HistoryAccess",
  }

  static getInstance(): EncryptedStorage {
    if (!EncryptedStorage.instance) {
      EncryptedStorage.instance = new EncryptedStorage()
    }
    return EncryptedStorage.instance
  }

  private async getEncryptionKey(signer: any, address: string): Promise<string> {
    try {
      const message = {
        action: "Access Transaction History",
        timestamp: Math.floor(Date.now() / 1000),
        address: address,
      }

      const signature = await signer._signTypedData(
        this.SIGNATURE_MESSAGE.domain,
        { HistoryAccess: this.SIGNATURE_MESSAGE.types.HistoryAccess },
        message,
      )

      // Use signature as encryption key
      return CryptoJS.SHA256(signature).toString()
    } catch (error) {
      console.error("Error getting encryption key:", error)
      throw new Error("Failed to get encryption key. Please make sure your wallet supports signing.")
    }
  }

  private encrypt(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString()
  }

  private decrypt(encryptedData: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key)
    return bytes.toString(CryptoJS.enc.Utf8)
  }

  private getStorageKey(address: string): string {
    return `${this.STORAGE_PREFIX}${address.toLowerCase()}`
  }

  async getHistory(signer: any, address: string): Promise<HistoryEntry[]> {
    try {
      const key = await this.getEncryptionKey(signer, address)
      const storageKey = this.getStorageKey(address)
      const encryptedData = localStorage.getItem(storageKey)

      if (!encryptedData) {
        return []
      }

      const decryptedData = this.decrypt(encryptedData, key)
      if (!decryptedData) {
        throw new Error("Failed to decrypt history data")
      }

      const history: HistoryEntry[] = JSON.parse(decryptedData)
      return history.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
      console.error("Error getting history:", error)
      throw new Error("Failed to decrypt history. Please try again.")
    }
  }

  async addHistoryEntry(entry: HistoryEntry, signer: any, address: string): Promise<void> {
    try {
      const currentHistory = await this.getHistory(signer, address).catch(() => [])
      const updatedHistory = [entry, ...currentHistory]

      const key = await this.getEncryptionKey(signer, address)
      const encryptedData = this.encrypt(JSON.stringify(updatedHistory), key)
      const storageKey = this.getStorageKey(address)

      localStorage.setItem(storageKey, encryptedData)
    } catch (error) {
      console.error("Error adding history entry:", error)
      throw new Error("Failed to save history entry")
    }
  }

  async updateHistoryEntry(
    entryId: string,
    updates: Partial<HistoryEntry>,
    signer: any,
    address: string,
  ): Promise<void> {
    try {
      const currentHistory = await this.getHistory(signer, address)
      const updatedHistory = currentHistory.map((entry) => (entry.id === entryId ? { ...entry, ...updates } : entry))

      const key = await this.getEncryptionKey(signer, address)
      const encryptedData = this.encrypt(JSON.stringify(updatedHistory), key)
      const storageKey = this.getStorageKey(address)

      localStorage.setItem(storageKey, encryptedData)
    } catch (error) {
      console.error("Error updating history entry:", error)
      throw new Error("Failed to update history entry")
    }
  }

  async clearHistory(address: string): Promise<void> {
    const storageKey = this.getStorageKey(address)
    localStorage.removeItem(storageKey)
  }

  hasEncryptedHistory(address: string): boolean {
    const storageKey = this.getStorageKey(address)
    return localStorage.getItem(storageKey) !== null
  }
}

export default EncryptedStorage
