import {
  AppIdentity,
  createSolanaDevnet,
  createSolanaMainnet,
  SolanaCluster,
} from '@wallet-ui/react-native-kit'

// Helius RPC for fast, reliable data
// Free tier: 100K credits/month - sufficient for hackathon
const HELIUS_RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=8d0eb0c7-f3ef-46a0-915d-9e4728b04daa'

export class AppConfig {
  static identity: AppIdentity = {
    name: 'Fullport',
    uri: 'https://fullport.app',
    // icon must be relative URI for Mobile Wallet Adapter
  }

  static networks: SolanaCluster[] = [
    createSolanaMainnet({
      url: HELIUS_RPC_URL,
      label: 'Mainnet (Helius)',
    }),
    createSolanaDevnet({ url: 'https://api.devnet.solana.com' }),
  ]
}

// SKR Token Configuration - Official Addresses
export const SKR_CONFIG = {
  // Official SKR addresses from stake.solanamobile.com
  mint: 'SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3',
  stakingProgram: 'SKRskrmtL83pcL4YqLWt6iPefDqwXQWHSw9S9vz94BZ',
  stakeVault: '8isViKbwhuhFhsv2t8vaFL74pKCqaFPQXo1KkeQwZbB8',
  authority: 'Hgbea5UFVXD3dQoL2mJbXLVnnFFRqyJJis9vfm69w5oQ',
  primaryGuardian: 'SKRGdBwzb1AtFW2chhBnZpGFnFLj6Mi7HM7iwjXALvw',
  decimals: 9,
  symbol: 'SKR',
  name: 'Seeker',
  logoUri: 'https://coin-images.coingecko.com/coins/images/70974/large/seeker-logo.jpg',
  // Staking parameters
  minStake: 1_000_000, // 1M base units = 0.001 SKR
  cooldownPeriod: 172_800, // 48 hours in seconds
  compoundInterval: 172_800, // 48 hours
  initialInflation: 0.10, // 10% at TGE
  currentApy: 0.211, // 21.1% as of Feb 2026
}

// Guardian list (first cohort)
export const GUARDIANS = [
  {
    address: 'SKRGdBwzb1AtFW2chhBnZpGFnFLj6Mi7HM7iwjXALvw',
    name: 'Solana Mobile',
    commission: 0,
    active: true,
  },
  // Additional guardians to be added: Anza, Jito, DoubleZero, Helius, Triton
]

// Jupiter Price API
export const JUPITER_PRICE_API = 'https://api.jup.ag/price/v2'

// Known token mints for portfolio display
export const KNOWN_TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  SKR: 'SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
}
