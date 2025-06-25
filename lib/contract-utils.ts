let ethers: any = null

// Dynamic import for ethers
const getEthers = async () => {
  if (!ethers) {
    ethers = await import("ethers")
  }
  return ethers
}

import { getCurrentBlockchainConfig, getBlockchainByChainId } from "./blockchain-config"

// Contract ABI
export const CONTRACT_ABI = [
  "constructor(address _owner)",
  "function lockNative(bytes32 commitment) payable",
  "function lockERC20(bytes32 commitment, address tokenAddress, uint256 amount)",
  "function withdraw(bytes32 nullifier)",
  "function pause()",
  "function unpause()",
  "function isNullifierUsed(bytes32 nullifier) view returns (bool)",
  "function getLockedDetails(bytes32 commitment) view returns (uint256, address)",
  "function usedCommitments(bytes32) view returns (bool)",
  "function lockedAmounts(bytes32) view returns (uint256)",
  "function lockedTokenAddresses(bytes32) view returns (address)",
  "function usedNullifiers(bytes32) view returns (bool)",
  "event FundsLocked(address indexed user, bytes32 commitment, uint256 amount, address tokenAddress, bool isNative)",
  "event FundsWithdrawn(address indexed recipient, bytes32 nullifier, uint256 amount, address tokenAddress, bool isNative)",
  "event EmergencyPause(address indexed owner, bool paused)",
  "event EmergencyUnpause(address indexed owner, bool paused)",
]

// ERC20 ABI for token interactions
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)",
]

// Generate cryptographic primitives
export async function generateSecret(): Promise<string> {
  const ethersLib = await getEthers()
  return ethersLib.utils.hexlify(ethersLib.utils.randomBytes(32))
}

export async function computeNullifier(secret: string): Promise<string> {
  const ethersLib = await getEthers()
  return ethersLib.utils.keccak256(
    ethersLib.utils.concat([ethersLib.utils.toUtf8Bytes("secret"), ethersLib.utils.arrayify(secret)]),
  )
}

export async function computeCommitment(nullifier: string): Promise<string> {
  const ethersLib = await getEthers()
  return ethersLib.utils.keccak256(
    ethersLib.utils.concat([ethersLib.utils.toUtf8Bytes("commitment"), ethersLib.utils.arrayify(nullifier)]),
  )
}

// Get provider for specific blockchain
export async function getProvider(blockchainKey?: string) {
  const ethersLib = await getEthers()
  const config = blockchainKey
    ? Object.values(getCurrentBlockchainConfig()).find((c) => c === blockchainKey) || getCurrentBlockchainConfig()
    : getCurrentBlockchainConfig()
  return new ethersLib.providers.JsonRpcProvider(config.rpcUrl)
}

// Get WebSocket provider for live updates
export async function getWebSocketProvider(blockchainKey?: string) {
  const ethersLib = await getEthers()
  const config = getCurrentBlockchainConfig()
  if (!config.wsUrl) return null
  return new ethersLib.providers.WebSocketProvider(config.wsUrl)
}

// Get contract instance
export async function getContract(signerOrProvider?: any) {
  const ethersLib = await getEthers()
  const config = getCurrentBlockchainConfig()
  const provider = signerOrProvider || (await getProvider())
  return new ethersLib.Contract(config.contractAddress, CONTRACT_ABI, provider)
}

// Get ERC20 token contract
export async function getTokenContract(tokenAddress: string, signerOrProvider?: any) {
  const ethersLib = await getEthers()
  const provider = signerOrProvider || (await getProvider())
  return new ethersLib.Contract(tokenAddress, ERC20_ABI, provider)
}

// Get token details from contract
export async function getTokenDetails(tokenAddress: string): Promise<{
  name: string
  symbol: string
  decimals: number
} | null> {
  try {
    const tokenContract = await getTokenContract(tokenAddress)
    const [name, symbol, decimals] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
    ])
    return { name, symbol, decimals }
  } catch (error) {
    console.error("Error getting token details:", error)
    return null
  }
}

// Check if address is a valid ERC20 token
export async function isValidERC20(tokenAddress: string): Promise<boolean> {
  try {
    const details = await getTokenDetails(tokenAddress)
    return details !== null
  } catch {
    return false
  }
}

// Format amount for display (ethers v5 compatible)
export async function formatAmount(amount: string, decimals = 18): Promise<string> {
  const ethersLib = await getEthers()
  return ethersLib.utils.formatUnits(amount, decimals)
}

// Parse amount for contract interaction (ethers v5 compatible)
export async function parseAmount(amount: string, decimals = 18) {
  const ethersLib = await getEthers()
  return ethersLib.utils.parseUnits(amount, decimals)
}

// Check if MetaMask is available
export function isMetaMaskAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
}

// Get MetaMask provider (ethers v5 compatible)
export async function getMetaMaskProvider() {
  if (!isMetaMaskAvailable()) return null
  const ethersLib = await getEthers()
  return new ethersLib.providers.Web3Provider((window as any).ethereum, "any")
}

// Request account access
export async function requestAccounts(): Promise<string[]> {
  if (!isMetaMaskAvailable()) {
    throw new Error("MetaMask not available")
  }
  return await window.ethereum.request({ method: "eth_requestAccounts" })
}

// Switch to specific blockchain network
export async function switchToNetwork(chainId: number): Promise<void> {
  if (!isMetaMaskAvailable()) {
    throw new Error("MetaMask not available")
  }

  const config = getBlockchainByChainId(chainId)
  if (!config) {
    throw new Error("Unsupported network")
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    })
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: config.name,
              nativeCurrency: config.nativeCurrency,
              rpcUrls: [config.rpcUrl],
              blockExplorerUrls: [config.blockExplorerUrl],
            },
          ],
        })
      } catch (addError) {
        throw new Error(`Failed to add ${config.name} network`)
      }
    } else {
      throw new Error(`Failed to switch to ${config.name} network`)
    }
  }
}

// Switch to current blockchain
export async function switchToCurrentNetwork(): Promise<void> {
  const config = getCurrentBlockchainConfig()
  return switchToNetwork(config.chainId)
}

// Validate commitment format
export async function isValidCommitment(commitment: string): Promise<boolean> {
  const ethersLib = await getEthers()
  return ethersLib.utils.isHexString(commitment, 32)
}

// Validate nullifier format
export async function isValidNullifier(nullifier: string): Promise<boolean> {
  const ethersLib = await getEthers()
  return ethersLib.utils.isHexString(nullifier, 32)
}

// Get transaction receipt with retry
export async function waitForTransaction(txHash: string, confirmations = 1, timeout = 60000) {
  const provider = await getProvider()
  return await provider.waitForTransaction(txHash, confirmations, timeout)
}

// Estimate gas for transaction
export async function estimateGas(contract: any, method: string, params: any[], overrides: any = {}) {
  return await contract.estimateGas[method](...params, overrides)
}

// Get current gas price
export async function getGasPrice() {
  const provider = await getProvider()
  return await provider.getGasPrice()
}

// Get token balance
export async function getTokenBalance(tokenAddress: string, userAddress: string, provider?: any) {
  const tokenContract = await getTokenContract(tokenAddress, provider)
  return await tokenContract.balanceOf(userAddress)
}

// Get native balance
export async function getNativeBalance(userAddress: string, provider?: any) {
  const providerInstance = provider || (await getProvider())
  return await providerInstance.getBalance(userAddress)
}
