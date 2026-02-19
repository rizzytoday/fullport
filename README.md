# Fullport

> **Your full Solana portfolio. Native on Seeker.**

Built for [Monolith 2026](https://solanamobile.com/hackathon) — the Solana Mobile hackathon.

[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20Seeker-black?style=flat-square)](https://solanamobile.com)
[![Framework](https://img.shields.io/badge/Expo-SDK%2054-000020?style=flat-square&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?style=flat-square&logo=react)](https://reactnative.dev)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Hackathon](https://img.shields.io/badge/Monolith%202026-Solana%20Mobile-9945FF?style=flat-square)](https://solanamobile.com/hackathon)

---

Fullport is the portfolio app that should come pre-installed on every Seeker. Track all your Solana tokens with live prices, stake SKR with a single fingerprint tap, monitor your staking income, and get AI-powered insights — in a premium glass-morphism UI designed specifically for the mobile-first Solana user.

Every transaction is signed inside **Seeker's hardware Trusted Execution Environment** via Seed Vault. Your private keys never leave the chip.

---

## Features

### Portfolio Management
- **Real-time holdings** — All SPL tokens with live prices via Helius DAS API
- **Portfolio history chart** — Value over time with 1D / 1W / 1M / 3M / 1Y / ALL timeframes
- **Interactive token charts** — Tap any token, scrub the price chart with your finger
- **Allocation view** — Donut chart breakdown with Assets / Position toggle
- **Position breakdown** — Staked vs Liquid vs Stable vs Locked
- **Sparkline charts** — Mini price graphs on every token row
- **Multi-wallet support** — Watch multiple wallets, view aggregated or individually
- **Custom tokens** — Add any SPL token by mint address
- **AI Insights** — Smart portfolio analysis surfacing real opportunities

### SKR Staking — Complete Lifecycle
- **Stake** — Delegate SKR to a Guardian in one tap (21.1% APY)
- **Cancel-Unstake** — Changed your mind during cooldown? Cancel and auto-restake
- **Unstake** — Initiate the 48-hour cooldown with a clear visual countdown
- **Withdraw** — Guided second step once cooldown completes — no missed withdrawals
- **Guardian selection** — Choose your validator (Solana Mobile now; Anza, Jito, Helius, DoubleZero, Triton coming)
- **Staking income tracker** — Daily, monthly, and all-time earned
- **Projected rewards chart** — See earnings over 1M / 3M / 6M / 12M at current APY
- **APY calculator** — Project your own stake amount

### Seed Vault Integration
- **Hardware-secured signing** — Every transaction signed inside Seeker's TEE via Mobile Wallet Adapter
- **Biometric authorization** — Double-tap + fingerprint = transaction signed. No passphrase, no browser popup
- **Root-proof key isolation** — Keys stored in the secure enclave; inaccessible even on a rooted device
- **Genesis Token detection** — Detects your Seeker Genesis Token on-chain and unlocks Seeker-exclusive features

### Security & UX
- **Biometric lock** — Face ID / Fingerprint with auto-lock when app backgrounds
- **Price alerts** — Native notifications when tokens hit your target
- **Haptic feedback** — Tactile response on every meaningful interaction
- **Offline detection** — Graceful degradation when network drops
- **Pull to refresh** — Manual refresh with haptic confirmation
- **Demo mode** — Full app experience without connecting a wallet

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) SDK 54 + React Native 0.76 |
| Routing | [Expo Router](https://docs.expo.dev/router/introduction/) v4 (file-based) |
| State | [Zustand](https://zustand-demo.pmnd.rs/) with AsyncStorage persistence |
| Data Fetching | [TanStack Query](https://tanstack.com/query) v5 (caching, background refetch) |
| Wallet | [@wallet-ui/react-native-kit](https://www.npmjs.com/package/@wallet-ui/react-native-kit) — Mobile Wallet Adapter |
| Animations | [Reanimated](https://docs.swmansion.com/react-native-reanimated/) 4.x |
| Solana Data | [Helius DAS API](https://helius.dev) — balances, metadata, prices in one call |
| Token Prices | [Jupiter Price API](https://station.jup.ag/docs/apis/price-api) |
| UI | Custom glass-morphism design system (iOS 18-inspired, dark theme) |

---

## Seed Vault & MWA Architecture

Fullport uses the **Mobile Wallet Adapter (MWA)** protocol to interact with Seeker's Seed Vault — the hardware-backed key custody system built into the device's Trusted Execution Environment.

```
┌─────────────────────────────────────────────────────┐
│                    Fullport (dApp)                   │
│                                                     │
│  Build Transaction  ──►  transact(wallet => {       │
│  (stake, unstake,           wallet.signAndSend()    │
│   withdraw, swap)         })                        │
└──────────────────────────────┬──────────────────────┘
                               │ MWA protocol
                               ▼
┌─────────────────────────────────────────────────────┐
│              Seed Vault Wallet (System)             │
│                                                     │
│  Shows transaction details  ──►  User approves      │
│  to user (amounts, program)       with fingerprint  │
└──────────────────────────────┬──────────────────────┘
                               │ Signs inside TEE
                               ▼
┌─────────────────────────────────────────────────────┐
│         Hardware TEE / Secure Enclave               │
│                                                     │
│  Private key never leaves this boundary.            │
│  Signed transaction returned to Fullport.           │
└─────────────────────────────────────────────────────┘
```

**Key principle:** Fullport never touches private keys. Transaction construction happens in the app; signing happens entirely inside the hardware.

---

## SKR Staking Flow

The SKR staking program has a **two-step unstake process** that most UIs don't surface clearly. Fullport guides you through every step:

```
Stake ──► Earning (21.1% APY)
             │
             ▼
         Unstake ──► [48h Cooldown] ──► Withdraw
             │              │
             │         Cancel-Unstake
             │         (tokens auto-restake)
             │
          [Repeat]
```

All four operations (`stake`, `unstake`, `cancel_unstake`, `withdraw`) are separate on-chain instructions — Fullport is the only portfolio app that handles the complete lifecycle in one place.

---

## Getting Started

### Prerequisites
- Node.js 18+
- Android device or emulator (API 31+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Install & Run

```bash
git clone https://github.com/rizzytoday/fullport.git
cd fullport
npm install
npm run android   # launches on connected device/emulator
```

### Demo Mode

No wallet needed. Toggle demo mode in `constants/mock-data.ts`:

```typescript
export const DEMO_MODE = true  // pre-loaded portfolio data
```

Demo mode is on by default — the full app experience works without a connected wallet.

---

## Building the APK

Requires Java 17 and Android SDK.

```bash
# Prebuild the Android project
npx expo prebuild --platform android

# Build a release APK
cd android && ./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

---

## Project Structure

```
fullport/
├── app/                      # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx         # Portfolio screen
│   │   ├── skr.tsx           # SKR staking screen
│   │   ├── history.tsx       # Transaction history
│   │   └── settings.tsx      # Settings & preferences
│   └── token/[mint].tsx      # Token detail (dynamic route)
│
├── features/                 # Feature modules
│   ├── portfolio/            # Holdings, charts, allocation, alerts
│   ├── skr/                  # Full staking lifecycle UI & logic
│   ├── history/              # Transaction history
│   └── settings/             # Preferences, watched wallets
│
├── stores/                   # Zustand state stores
│   ├── portfolio-store.ts
│   ├── portfolio-history-store.ts
│   ├── skr-store.ts
│   ├── staking-rewards-store.ts
│   ├── auth-store.ts
│   ├── custom-tokens-store.ts
│   └── watched-wallets-store.ts
│
├── constants/                # Config, theme, mock data
│   ├── theme.ts              # Colors, typography, spacing
│   ├── app-config.ts         # API keys, program addresses
│   └── mock-data.ts          # Demo mode data
│
├── components/               # Shared UI components
├── hooks/                    # Custom React hooks
├── services/                 # API layer (Helius, Jupiter)
└── utils/                    # Helpers and formatters
```

---

## Key Implementation Notes

### One Helius Call, Everything
```typescript
// getAssetsByOwner returns balances + metadata + prices in a single request
const { tokens, nativeBalance } = await helius.rpc.getAssetsByOwner({
  ownerAddress: wallet,
  displayOptions: { showFungible: true, showNativeBalance: true }
})
```

### MWA Transaction Signing
```typescript
// Every staking operation follows this pattern
await transact(async (wallet) => {
  const { blockhash } = await connection.getLatestBlockhash()
  const tx = buildStakeTransaction({ amount, guardian, blockhash })
  await wallet.signAndSendTransactions({ transactions: [tx] })
})
```

### Genesis Token Detection
```typescript
// Detect Seeker users and unlock Seeker-exclusive UI
const GENESIS_TOKEN_MINT = 'GT2zuHVaZQYZSyQMgJPLzvkmyztfyXg2NJunqFp4p3A4'
const isSeeker = holdings.some(t => t.mint === GENESIS_TOKEN_MINT)
```

### SKR Config
```typescript
export const SKR_CONFIG = {
  mint:           'SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3',
  stakingProgram: 'SKRskrmtL83pcL4YqLWt6iPefDqwXQWHSw9S9vz94BZ',
  stakeVault:     '8isViKbwhuhFhsv2t8vaFL74pKCqaFPQXo1KkeQwZbB8',
  currentApy:     0.211,      // 21.1%
  cooldown:       172_800,    // 48 hours in seconds
}
```

---

## Roadmap

### Shipped ✅
- Real-time portfolio tracking (Helius DAS)
- Portfolio history chart (1D–ALL)
- Allocation view with donut chart + position breakdown
- SKR staking: full lifecycle (stake / cancel-unstake / unstake / withdraw)
- Staking income tracker + projected rewards chart
- Cooldown timer with animated ring
- AI-powered portfolio insights
- Price alerts with native notifications
- Biometric lock (Face ID / Fingerprint)
- Multi-wallet aggregation
- Token detail with interactive charts + sparklines
- Demo mode (no wallet required)
- Genesis Token detection (Seeker Mode foundation)

### Coming Next
- Multiple guardian selection (Anza, Jito, Helius, DoubleZero, Triton)
- Seeker Mode: `.skr` address display + Activity Tracking
- Transaction history from on-chain data
- NFT gallery view
- DeFi position tracking
- Push notifications for staking milestones

---

## API Reference

| API | Purpose | Docs |
|---|---|---|
| Helius DAS | Token balances, metadata, prices | [helius.dev](https://helius.dev) |
| Jupiter Price | Real-time SPL token prices | [station.jup.ag](https://station.jup.ag/docs/apis/price-api) |
| Solana Mobile MWA | Transaction signing via Seed Vault | [docs.solanamobile.com](https://docs.solanamobile.com/developers/mobile-wallet-adapter) |
| SKR Staking Program | On-chain staking operations | [stake.solanamobile.com](https://stake.solanamobile.com) |

---

## Acknowledgments

- [Solana Mobile](https://solanamobile.com) — For Seeker, Seed Vault, and SKR
- [Helius](https://helius.dev) — Best-in-class Solana RPC and DAS API
- [Jupiter](https://jup.ag) — Reliable, fast price feeds
- [Expo](https://expo.dev) — React Native toolchain that actually works

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built for [Monolith 2026](https://solanamobile.com/hackathon) · Solana Mobile Hackathon**

*Fullport — Your Solana portfolio, elevated.*

</div>
