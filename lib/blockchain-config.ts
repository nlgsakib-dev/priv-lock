export interface BlockchainConfig {
  chainId: number
  name: string
  symbol: string
  rpcUrl: string
  wsUrl?: string
  blockExplorerUrl: string
  contractAddress: string
  isTestnet: boolean
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

export interface TokenConfig {
  symbol: string
  name: string
  address: string
  decimals: number
  icon: string
  isNative: boolean
  balance?: string
}

// Blockchain configurations
export const BLOCKCHAIN_CONFIGS: Record<string, BlockchainConfig> = {
  mindchain: {
    chainId: 9996,
    name: "MindChain Mainnet",
    symbol: "MIND",
    rpcUrl: "https://seednode.mindchain.info/",
    wsUrl: "wss://seednode.mindchain.info/ws",
    blockExplorerUrl: "https://mainnet.mindscan.info/",
    contractAddress: "0xd0605445dd6D5ea9C5c8809CeBc35CC4fDBA24D1",
    isTestnet: false,
    nativeCurrency: {
      name: "MIND",
      symbol: "MIND",
      decimals: 18,
    },
  },
}

// Only native tokens are predefined
export const NATIVE_TOKENS: Record<string, TokenConfig> = {
  mindchain: {
    symbol: "MIND",
    name: "MindChain",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    icon: "⟠",
    isNative: true,
  },
}

// -----------------------------------------------------------------------------
// 🔗 Token registry ­– extend this per-chain as you add more tokens
// -----------------------------------------------------------------------------

/** Map of <blockchainKey, { SYMBOL: TokenConfig }> */
export const TOKEN_LISTS: Record<string, Record<string, TokenConfig>> = {
  mindchain: {
    // Native token is always present
    [NATIVE_TOKENS.mindchain.symbol]: NATIVE_TOKENS.mindchain,
    // Add ERC-20s here, e.g.
    // USDC: {
    //   symbol: "USDC",
    //   name: "USD Coin",
    //   address: "0x1234…",
    //   decimals: 6,
    //   icon: "$",
    //   isNative: false,
    // },
  },
}

/**
 * Return the token list for the currently-selected blockchain.
 * You can freely mutate/extend this structure elsewhere (e.g. after token detection).
 */
export function getCurrentTokens(): Record<string, TokenConfig> {
  return TOKEN_LISTS[DEFAULT_BLOCKCHAIN] ?? {}
}

// Default blockchain
export const DEFAULT_BLOCKCHAIN = "mindchain"

// Get current blockchain config
export function getCurrentBlockchainConfig(): BlockchainConfig {
  return BLOCKCHAIN_CONFIGS[DEFAULT_BLOCKCHAIN]
}

// Get native token for current blockchain
export function getNativeToken(): TokenConfig {
  return NATIVE_TOKENS[DEFAULT_BLOCKCHAIN]
}

// Get blockchain config by chain ID
export function getBlockchainByChainId(chainId: number): BlockchainConfig | null {
  return Object.values(BLOCKCHAIN_CONFIGS).find((config) => config.chainId === chainId) || null
}

// Get blockchain key by chain ID
export function getBlockchainKeyByChainId(chainId: number): string | null {
  const entry = Object.entries(BLOCKCHAIN_CONFIGS).find(([, config]) => config.chainId === chainId)
  return entry ? entry[0] : null
}
