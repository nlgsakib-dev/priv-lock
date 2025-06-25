"use client"

export interface CachedToken {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: string
  lastUpdated: number
  icon: string
  isNative: boolean
}

export interface TokenCache {
  [address: string]: CachedToken
}

class TokenCacheManager {
  private static instance: TokenCacheManager
  private cache: Map<string, TokenCache> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private readonly STORAGE_KEY = "mixion_token_cache"

  static getInstance(): TokenCacheManager {
    if (!TokenCacheManager.instance) {
      TokenCacheManager.instance = new TokenCacheManager()
    }
    return TokenCacheManager.instance
  }

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        this.cache = new Map(Object.entries(data))
      }
    } catch (error) {
      console.error("Error loading token cache:", error)
    }
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.cache)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving token cache:", error)
    }
  }

  // Get cached tokens for an address
  getCachedTokens(userAddress: string): CachedToken[] {
    const userCache = this.cache.get(userAddress.toLowerCase())
    if (!userCache) return []

    const now = Date.now()
    const validTokens: CachedToken[] = []

    Object.values(userCache).forEach((token) => {
      if (now - token.lastUpdated < this.CACHE_DURATION) {
        validTokens.push(token)
      }
    })

    return validTokens
  }

  // Cache tokens for a user
  cacheTokens(userAddress: string, tokens: CachedToken[]): void {
    const userKey = userAddress.toLowerCase()
    const userCache: TokenCache = {}

    tokens.forEach((token) => {
      userCache[token.address.toLowerCase()] = {
        ...token,
        lastUpdated: Date.now(),
      }
    })

    this.cache.set(userKey, userCache)
    this.saveToStorage()
  }

  // Update single token
  updateToken(userAddress: string, token: CachedToken): void {
    const userKey = userAddress.toLowerCase()
    const userCache = this.cache.get(userKey) || {}

    userCache[token.address.toLowerCase()] = {
      ...token,
      lastUpdated: Date.now(),
    }

    this.cache.set(userKey, userCache)
    this.saveToStorage()
  }

  // Check if cache is valid
  isCacheValid(userAddress: string): boolean {
    const userCache = this.cache.get(userAddress.toLowerCase())
    if (!userCache) return false

    const now = Date.now()
    const tokens = Object.values(userCache)

    return tokens.length > 0 && tokens.some((token) => now - token.lastUpdated < this.CACHE_DURATION)
  }

  // Clear cache for user
  clearUserCache(userAddress: string): void {
    this.cache.delete(userAddress.toLowerCase())
    this.saveToStorage()
  }

  // Clear all cache
  clearAllCache(): void {
    this.cache.clear()
    localStorage.removeItem(this.STORAGE_KEY)
  }

  // Get cached token info (for contract details)
  getCachedTokenInfo(tokenAddress: string): Omit<CachedToken, "balance" | "lastUpdated"> | null {
    for (const userCache of this.cache.values()) {
      const token = userCache[tokenAddress.toLowerCase()]
      if (token) {
        return {
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          icon: token.icon,
          isNative: token.isNative,
        }
      }
    }
    return null
  }
}

export default TokenCacheManager
