import { Instruction, Address, address, getAddressEncoder } from '@solana/kit'
import { SKR_CONFIG, GUARDIANS } from '@/constants/app-config'

// Helius RPC for fetching account data
const HELIUS_API_KEY = '8d0eb0c7-f3ef-46a0-915d-9e4728b04daa'
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`

// SKR Staking Program instruction discriminators
// These are derived from the Anchor IDL - first 8 bytes of sha256("global:instruction_name")
const INSTRUCTION_DISCRIMINATORS = {
  stake: new Uint8Array([206, 176, 202, 18, 200, 209, 179, 108]), // stake
  unstake: new Uint8Array([90, 95, 107, 42, 205, 124, 50, 225]), // unstake
  claimRewards: new Uint8Array([4, 144, 132, 71, 116, 23, 151, 80]), // claim_rewards
}

// Derive the user's stake account PDA
export async function deriveStakeAccountPDA(
  userAddress: string
): Promise<{ address: string; bump: number }> {
  // Stake account is derived from: [b"stake", user_pubkey, program_id]
  // For now, we'll use a simplified approach since we don't have the exact seeds
  const encoder = getAddressEncoder()

  // This would be the actual PDA derivation in production
  // Using program ID and user address as seeds
  const programId = SKR_CONFIG.stakingProgram

  // For demo purposes, we'll simulate the PDA
  // In production, this would use proper PDA derivation
  return {
    address: `${userAddress.slice(0, 8)}...stake`,
    bump: 255,
  }
}

// Get the user's associated token account for SKR
export async function getSkrTokenAccount(
  userAddress: string
): Promise<string | null> {
  try {
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'get-skr-ata',
        method: 'getTokenAccountsByOwner',
        params: [
          userAddress,
          { mint: SKR_CONFIG.mint },
          { encoding: 'jsonParsed' },
        ],
      }),
    })

    const data = await response.json()

    if (data.result?.value?.length > 0) {
      return data.result.value[0].pubkey
    }

    return null
  } catch (error) {
    console.error('Failed to get SKR token account:', error)
    return null
  }
}

// Build stake instruction
export function buildStakeInstruction(params: {
  userAddress: string
  amount: number // in base units (lamports)
  guardianAddress?: string
}): Instruction {
  const {
    userAddress,
    amount,
    guardianAddress = SKR_CONFIG.primaryGuardian,
  } = params

  // Encode the amount as little-endian u64
  const amountBuffer = new ArrayBuffer(8)
  const view = new DataView(amountBuffer)
  view.setBigUint64(0, BigInt(amount), true) // true = little-endian

  // Build instruction data: discriminator + amount
  const data = new Uint8Array(8 + 8)
  data.set(INSTRUCTION_DISCRIMINATORS.stake, 0)
  data.set(new Uint8Array(amountBuffer), 8)

  // Account metas for stake instruction
  // Order: user, stake_account, token_account, stake_vault, guardian, token_program, system_program
  const accounts = [
    { address: address(userAddress), role: 3 }, // Signer + Writable
    { address: address(SKR_CONFIG.stakeVault), role: 1 }, // Writable (stake account PDA would be derived)
    { address: address(SKR_CONFIG.mint), role: 0 }, // Read-only
    { address: address(SKR_CONFIG.stakeVault), role: 1 }, // Writable
    { address: address(guardianAddress), role: 0 }, // Read-only
    { address: address('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), role: 0 }, // Token Program
    { address: address('11111111111111111111111111111111'), role: 0 }, // System Program
  ]

  return {
    programAddress: address(SKR_CONFIG.stakingProgram),
    accounts,
    data,
  }
}

// Build unstake instruction
export function buildUnstakeInstruction(params: {
  userAddress: string
  amount: number // in base units
}): Instruction {
  const { userAddress, amount } = params

  // Encode the amount as little-endian u64
  const amountBuffer = new ArrayBuffer(8)
  const view = new DataView(amountBuffer)
  view.setBigUint64(0, BigInt(amount), true)

  // Build instruction data: discriminator + amount
  const data = new Uint8Array(8 + 8)
  data.set(INSTRUCTION_DISCRIMINATORS.unstake, 0)
  data.set(new Uint8Array(amountBuffer), 8)

  const accounts = [
    { address: address(userAddress), role: 3 }, // Signer + Writable
    { address: address(SKR_CONFIG.stakeVault), role: 1 }, // Writable
    { address: address(SKR_CONFIG.mint), role: 0 }, // Read-only
    { address: address('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), role: 0 }, // Token Program
  ]

  return {
    programAddress: address(SKR_CONFIG.stakingProgram),
    accounts,
    data,
  }
}

// Build claim rewards instruction
export function buildClaimRewardsInstruction(params: {
  userAddress: string
}): Instruction {
  const { userAddress } = params

  const data = new Uint8Array(8)
  data.set(INSTRUCTION_DISCRIMINATORS.claimRewards, 0)

  const accounts = [
    { address: address(userAddress), role: 3 }, // Signer + Writable
    { address: address(SKR_CONFIG.stakeVault), role: 1 }, // Writable
    { address: address(SKR_CONFIG.mint), role: 0 }, // Read-only
    { address: address('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), role: 0 }, // Token Program
  ]

  return {
    programAddress: address(SKR_CONFIG.stakingProgram),
    accounts,
    data,
  }
}

// Validate stake amount
export function validateStakeAmount(
  amount: number,
  balance: number
): { valid: boolean; error?: string } {
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' }
  }

  if (amount > balance) {
    return { valid: false, error: 'Insufficient balance' }
  }

  // Convert to base units for minimum check
  const baseUnits = amount * Math.pow(10, SKR_CONFIG.decimals)
  if (baseUnits < SKR_CONFIG.minStake) {
    const minAmount = SKR_CONFIG.minStake / Math.pow(10, SKR_CONFIG.decimals)
    return { valid: false, error: `Minimum stake is ${minAmount} SKR` }
  }

  return { valid: true }
}

// Format SKR amount for display
export function formatSkrAmount(amount: number, decimals: number = 2): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// Calculate projected rewards
export function calculateProjectedRewards(
  stakedAmount: number,
  apy: number,
  days: number
): number {
  const dailyRate = apy / 365
  return stakedAmount * dailyRate * days
}
