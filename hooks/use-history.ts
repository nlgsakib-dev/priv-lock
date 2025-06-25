"use client"

import { useState, useCallback, useEffect } from "react"
import EncryptedStorage, { type HistoryEntry } from "@/lib/encrypted-storage"
import { useWallet } from "./use-wallet"

export function useHistory() {
  const { wallet, getSigner } = useWallet()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [hasHistory, setHasHistory] = useState(false)

  const storage = EncryptedStorage.getInstance()

  // Check if user has encrypted history
  useEffect(() => {
    if (wallet.address) {
      const hasEncryptedHistory = storage.hasEncryptedHistory(wallet.address)
      setHasHistory(hasEncryptedHistory)
    }
  }, [wallet.address])

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
        setHasHistory(true)

        if (isUnlocked) {
          setHistory((prev) => [fullEntry, ...prev])
        }

        return fullEntry
      } catch (err) {
        console.error("Error adding history entry:", err)
        throw err
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
        throw err
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
      setHasHistory(false)
    } catch (err) {
      console.error("Error clearing history:", err)
    }
  }, [wallet.address])

  const getRecentActivity = useCallback(
    async (limit = 5): Promise<HistoryEntry[]> => {
      if (!wallet.address || !wallet.isConnected) return []

      const signer = getSigner()
      if (!signer) return []

      try {
        const historyData = await storage.getHistory(signer, wallet.address)
        return historyData.slice(0, limit)
      } catch (err) {
        console.error("Error getting recent activity:", err)
        return []
      }
    },
    [wallet.address, wallet.isConnected, getSigner],
  )

  return {
    history,
    isLoading,
    error,
    isUnlocked,
    hasHistory,
    unlockHistory,
    addHistoryEntry,
    updateHistoryEntry,
    lockHistory,
    clearHistory,
    getRecentActivity,
  }
}
