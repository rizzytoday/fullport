# Fullport

**Mobile-first Solana portfolio tracker with native SKR staking for Seeker.**

Built for [Monolith 2026](https://solanamobile.com/hackathon) hackathon.

![Platform](https://img.shields.io/badge/platform-Android-green)
![Framework](https://img.shields.io/badge/framework-Expo%20SDK%2054-black)
![License](https://img.shields.io/badge/license-MIT-green)

Fullport is a dedicated portfolio app for Solana Seeker owners. Track all your tokens in one place, stake SKR with a single tap, set price alerts, and secure your portfolio with biometric lock. Designed for the mobile-first Solana user who wants a fast, beautiful, native experience.

---

## Features

### Portfolio Management
- **Real-time holdings** — View all tokens with live prices via Helius DAS API
- **Portfolio history chart** — Track value over time (1D, 1W, 1M, 3M, 1Y, ALL)
- **24h change tracking** — Color-coded gains/losses at a glance
- **Allocation chart** — Visual breakdown with Assets/Position toggle
- **Position breakdown** — See Staked vs Liquid vs Stable vs Locked
- **Sparkline charts** — Mini price graphs on every token
- **Multi-wallet support** — Watch multiple wallets, view aggregated or separately
- **Custom tokens** — Add any SPL token by mint address
- **AI Insights** — Smart portfolio analysis and recommendations

### SKR Staking (Seeker-Native)
- **One-tap staking** — Stake SKR directly in-app
- **Guardian selection** — Choose your validator (Solana Mobile, more coming)
- **Staking income tracker** — Track total earned, monthly, and daily average
- **Cooldown timer** — Visual circular countdown for unstaking
- **APY calculator** — See projected rewards at current rates
- **Rewards projection** — Milestone chart showing earnings over 1M, 3M, 6M, 12M
- **Income summary** — At-a-glance passive income metrics

### Security & UX
- **Biometric lock** — Face ID / Fingerprint with auto-lock on background
- **Price alerts** — Get notified when tokens hit your target price
- **Haptic feedback** — Tactile response on all interactions
- **Offline detection** — Graceful handling when network drops
- **Pull to refresh** — Manual refresh with haptic confirmation

---

## Screenshots

| Portfolio | Token Detail | SKR Staking | Settings |
|-----------|--------------|-------------|----------|
| Holdings list with allocation chart | Interactive price chart with timeframes | Stake/unstake with guardian selection | Biometric lock, alerts, wallets |

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Expo](https://expo.dev) SDK 54 + React Native |
| Routing | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based) |
| State | [Zustand](https://zustand-demo.pmnd.rs/) with AsyncStorage persistence |
| Data Fetching | [TanStack Query](https://tanstack.com/query) (auto-refresh, caching) |
| Wallet | [@wallet-ui/react-native-kit](https://www.npmjs.com/package/@wallet-ui/react-native-kit) |
| Animations | [Reanimated](https://docs.swmansion.com/react-native-reanimated/) 4.x |
| Blockchain | [Helius RPC](https://helius.dev) + [Jupiter Price API](https://station.jup.ag/docs/apis/price-api) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator or Android Emulator (or physical device)

### Installation

```bash
# Clone the repo
git clone https://github.com/rizzytoday/fullport.git
cd fullport

# Install dependencies
npm install

# Start development server
npm run dev
```

### Running on Device

**iOS Simulator:**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

**Physical Device:**
1. Install [Expo Go](https://expo.dev/client) on your phone
2. Scan the QR code from the terminal

### Building APK

```bash
# Prebuild Android project
npx expo prebuild --platform android

# Build release APK (requires Java 17)
cd android && ./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

---

## Project Structure

```
fullport/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Tab navigation
│   │   ├── index.tsx       # Portfolio screen
│   │   ├── skr.tsx         # SKR staking screen
│   │   ├── history.tsx     # Transaction history
│   │   └── settings.tsx    # Settings & preferences
│   └── token/[mint].tsx    # Token detail (dynamic route)
├── features/               # Feature modules
│   ├── portfolio/          # Holdings, charts, alerts
│   ├── skr/                # Staking logic & UI
│   ├── history/            # Transaction components
│   └── settings/           # Preferences, wallets
├── stores/                 # Zustand state stores
│   ├── portfolio-store.ts
│   ├── portfolio-history-store.ts
│   ├── skr-store.ts
│   ├── staking-rewards-store.ts
│   ├── auth-store.ts
│   └── ...
├── components/             # Shared UI components
├── constants/              # Config, styles, mock data
└── hooks/                  # Custom React hooks
```

---

## Key Implementation Details

### Multi-Wallet Aggregation

Watch multiple wallets and view combined holdings:

```typescript
// Parallel fetch for all watched wallets
const holdingsArrays = await Promise.all(
  addresses.map((address) => fetchTokenBalances(address))
)

// Merge by mint address
const aggregated = aggregateMultiWalletHoldings(holdingsArrays)
```

### SKR Staking Integration

Native integration with Solana Mobile's SKR staking program:

```typescript
const SKR_CONFIG = {
  mint: 'SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3',
  stakingProgram: 'SKRskrmtL83pcL4YqLWt6iPefDqwXQWHSw9S9vz94BZ',
  currentApy: 0.211, // 21.1%
  cooldownPeriod: 172_800, // 48 hours in seconds
}
```

### Price Alerts System

Persistent alerts that trigger native notifications:

```typescript
// Check on every portfolio refresh
if (token.priceUsd >= alert.targetPrice && alert.direction === 'above') {
  triggerNotification(alert)
  markAlertTriggered(alert.id)
}
```

---

## Configuration

### Environment Variables

For production, move API keys to environment variables:

```bash
# .env (not committed)
HELIUS_API_KEY=your_api_key_here
```

### Demo Mode

Toggle demo mode for screenshots without live data:

```typescript
// constants/mock-data.ts
export const DEMO_MODE = true // Set to false for live data
```

---

## API Usage

| API | Purpose | Rate Limit |
|-----|---------|------------|
| Helius RPC | Token balances, staking data | 100K credits/month (free) |
| Jupiter Price | Real-time token prices | Unlimited |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Roadmap

### Completed
- [x] Real-time portfolio tracking with Helius DAS
- [x] Portfolio history chart with time intervals
- [x] Allocation view switcher (Assets/Position)
- [x] SKR staking with guardian selection
- [x] Staking income tracker with history
- [x] Cooldown timer with visual countdown
- [x] Projected rewards milestone chart
- [x] AI-powered portfolio insights
- [x] Price alerts with notifications
- [x] Biometric lock (Face ID / Fingerprint)
- [x] Multi-wallet aggregation
- [x] Token detail with interactive charts
- [x] Sparkline price charts

### Coming Soon
- [ ] Transaction history from on-chain data
- [ ] Multiple guardian support (Anza, Jito, etc.)
- [ ] Push notifications for staking rewards
- [ ] NFT gallery view
- [ ] DeFi position tracking
- [ ] Referral system with partner rewards

---

## Acknowledgments

- [Solana Mobile](https://solanamobile.com) — For Seeker and SKR
- [Helius](https://helius.dev) — Best-in-class Solana RPC
- [Jupiter](https://jup.ag) — Reliable price feeds

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

**Built with care for the Solana Mobile ecosystem.**
