// Token metadata service using Helius DAS API
const HELIUS_API_KEY = '8d0eb0c7-f3ef-46a0-915d-9e4728b04daa'
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`

export interface TokenMetadata {
  mint: string
  symbol: string
  name: string
  decimals: number
  logoUri: string | null
  priceUsd: number | null
}

export interface TokenMetadataError {
  error: string
  code?: string
}

export type TokenMetadataResult =
  | { success: true; data: TokenMetadata }
  | { success: false; error: TokenMetadataError }

/**
 * Fetch token metadata from Helius by mint address
 */
export async function fetchTokenMetadata(mint: string): Promise<TokenMetadataResult> {
  // Validate mint address (basic check: 32-44 characters, base58)
  if (!mint || mint.length < 32 || mint.length > 44) {
    return {
      success: false,
      error: { error: 'Invalid mint address format', code: 'INVALID_ADDRESS' },
    }
  }

  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/
  if (!base58Regex.test(mint)) {
    return {
      success: false,
      error: { error: 'Invalid base58 characters in address', code: 'INVALID_ADDRESS' },
    }
  }

  try {
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'token-metadata',
        method: 'getAsset',
        params: {
          id: mint,
          displayOptions: {
            showFungible: true,
          },
        },
      }),
    })

    const data = await response.json()

    if (data.error) {
      return {
        success: false,
        error: { error: data.error.message || 'Failed to fetch token', code: 'API_ERROR' },
      }
    }

    const asset = data.result
    if (!asset) {
      return {
        success: false,
        error: { error: 'Token not found', code: 'NOT_FOUND' },
      }
    }

    // Extract metadata
    const metadata: TokenMetadata = {
      mint,
      symbol: asset.content?.metadata?.symbol || 'UNKNOWN',
      name: asset.content?.metadata?.name || 'Unknown Token',
      decimals: asset.token_info?.decimals ?? 9,
      logoUri: asset.content?.links?.image || null,
      priceUsd: asset.token_info?.price_info?.price_per_token ?? null,
    }

    return { success: true, data: metadata }
  } catch (error) {
    console.error('Failed to fetch token metadata:', error)
    return {
      success: false,
      error: {
        error: error instanceof Error ? error.message : 'Network error',
        code: 'NETWORK_ERROR',
      },
    }
  }
}

/**
 * Validate Solana address format
 */
export function isValidSolanaAddress(address: string): boolean {
  if (!address || address.length < 32 || address.length > 44) {
    return false
  }
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/
  return base58Regex.test(address)
}
