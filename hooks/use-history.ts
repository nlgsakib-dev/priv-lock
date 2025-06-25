"use client"

import { useState, useCallback } from "react"
import EncryptedStorage, { type HistoryEntry } from "@/lib/encrypted-storage"
import { useWallet } from "./use-wallet"

export function useHistory() {
  const { wallet, getSigner } = useWallet()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)

  const storage = EncryptedStorage.getInstance()

  const unlockHistory = useCallback(async () => {
    if (!wallet.address || !wallet.isConnected) {
      setError("Wallet not connected")
      return false
    }

    const signer = getSigner()
    if (!signer) {
      setError("Unable to get signer")
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const historyData = await storage.getHistory(signer, wallet.address)
      setHistory(historyData)
      setIsUnlocked(true)
      return true
    } catch (err: any) {
      console.error("Error unlocking history:", err)
      setError(err.message || "Failed to unlock history")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [wallet.address, wallet.isConnected, getSigner])

  const addHistoryEntry = useCallback(
    async (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
      if (!wallet.address || !wallet.isConnected) return

      const signer = getSigner()
      if (!signer) return

      try {
        const fullEntry: HistoryEntry = {
          ...entry,
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        }

        await storage.addHistoryEntry(fullEntry, signer, wallet.address)

        if (isUnlocked) {
          setHistory((prev) => [fullEntry, ...prev])
        }
      } catch (err) {
        console.error("Error adding history entry:", err)
      }
    },
    [wallet.address, wallet.isConnected, getSigner, isUnlocked],
  )

  const updateHistoryEntry = useCallback(
    async (entryId: string, updates: Partial<HistoryEntry>) => {
      if (!wallet.address || !wallet.isConnected) return

      const signer = getSigner()
      if (!signer) return

      try {
        await storage.updateHistoryEntry(entryId, updates, signer, wallet.address)

        if (isUnlocked) {
          setHistory((prev) => prev.map((entry) => (entry.id === entryId ? { ...entry, ...updates } : entry)))
        }
      } catch (err) {
        console.error("Error updating history entry:", err)
      }
    },
    [wallet.address, wallet.isConnected, getSigner, isUnlocked],
  )

  const lockHistory = useCallback(() => {
    setHistory([])
    setIsUnlocked(false)
    setError(null)
  }, [])

  const clearHistory = useCallback(async () => {
    if (!wallet.address) return

    try {
      await storage.clearHistory(wallet.address)
      setHistory([])
      setIsUnlocked(false)
    } catch (err) {
      console.error("Error clearing history:", err)
    }
  }, [wallet.address])

  return {
    history,
    isLoading,
    error,
    isUnlocked,
    unlockHistory,
    addHistoryEntry,
    updateHistoryEntry,
    lockHistory,
    clearHistory,
  }
}
