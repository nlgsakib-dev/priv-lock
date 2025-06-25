"use client"

interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  balance: string
  icon: string
  isLoading: boolean
}

interface CacheEntry {
  data: TokenInfo[]
  timestamp: number
  address: string
}

class TokenCache {
  private static instance: TokenCache
  private readonly CACHE_KEY = "mixion_token_cache"
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private readonly CONTRACT_CACHE_KEY = "mixion_contract_cache"
  private readonly CONTRACT_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  static getInstance(): TokenCache {
    if (!TokenCache.instance) {
      TokenCache.instance = new TokenCache()
    }
    return TokenCache.instance
  }

  private isValidCache(entry: CacheEntry, address: string): boolean {
    const now = Date.now()
    return entry.address.toLowerCase() === address.toLowerCase() && now - entry.timestamp < this.CACHE_DURATION
  }

  getCachedTokens(address: string): TokenInfo[] | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      if (!cached) return null

      const entry: CacheEntry = JSON.parse(cached)
      if (this.isValidCache(entry, address)) {
        return entry.data
      }

      // Cache expired, remove it
      this.clearCache()
      return null
    } catch (error) {
      console.error("Error reading token cache:", error)
      return null
    }
  }

  setCachedTokens(address: string, tokens: TokenInfo[]): void {
    try {
      const entry: CacheEntry = {
        data: tokens,
        timestamp: Date.now(),
        address: address.toLowerCase(),
      }
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(entry))
    } catch (error) {
      console.error("Error setting token cache:", error)
    }
  }

  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY)
  }

  // Contract info caching
  getCachedContractInfo(address: string): any | null {
    try {
      const cached = localStorage.getItem(this.CONTRACT_CACHE_KEY)
      if (!cached) return null

      const contractCache = JSON.parse(cached)
      const contractInfo = contractCache[address.toLowerCase()]

      if (contractInfo && Date.now() - contractInfo.timestamp < this.CONTRACT_CACHE_DURATION) {
        return contractInfo.data
      }

      return null
    } catch (error) {
      console.error("Error reading contract cache:", error)
      return null
    }
  }

  setCachedContractInfo(address: string, contractInfo: any): void {
    try {
      const cached = localStorage.getItem(this.CONTRACT_CACHE_KEY)
      const contractCache = cached ? JSON.parse(cached) : {}

      contractCache[address.toLowerCase()] = {
        data: contractInfo,
        timestamp: Date.now(),
      }

      localStorage.setItem(this.CONTRACT_CACHE_KEY, JSON.stringify(contractCache))
    } catch (error) {
      console.error("Error setting contract cache:", error)
    }
  }

  clearContractCache(): void {
    localStorage.removeItem(this.CONTRACT_CACHE_KEY)
  }

  // Clear all caches when user changes
  clearAllCaches(): void {
    this.clearCache()
    this.clearContractCache()
  }
}

export default TokenCache
