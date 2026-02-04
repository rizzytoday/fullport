# Fullport - Understanding the Codebase

*A learning document for Zen - making the complex understandable*

---

## What Is Fullport?

Fullport is a **mobile-first Solana portfolio tracker** built specifically for the **Seeker device** (Solana Mobile's new flagship). Think of it as the native portfolio app that should come pre-installed on every Seeker - showing your tokens, tracking SKR staking, and giving you a premium iOS-like experience.

The name "Fullport" = "Full Portfolio" - your complete financial picture on Solana, in your pocket.

---

## The Tech Stack (And Why Each Choice Matters)

### React Native + Expo
We're building a **native mobile app**, not a website. Expo gives us:
- Hot reloading during development
- Easy deployment to iOS/Android
- Built-in native modules (haptics, blur, gradients)
- Web preview for quick testing

### TypeScript
Strong typing catches bugs before they run. When you're dealing with financial data (token balances, prices), you don't want `undefined` sneaking through.

### Zustand for State Management
Instead of Redux's boilerplate hell, Zustand gives us simple stores:
```typescript
const usePortfolioStore = create((set) => ({
  holdings: [],
  setHoldings: (holdings) => set({ holdings })
}))
```

Each feature has its own store:
- `portfolio-store.ts` - Token holdings, total value
- `skr-store.ts` - SKR balance, staking info
- `settings-store.ts` - User preferences
- `custom-tokens-store.ts` - Manually added tokens (NEW)
- `watched-wallets-store.ts` - Multi-wallet tracking (NEW)

### React Query
Handles all the async data fetching:
- Automatic caching (don't fetch the same data twice)
- Background refetching (stay fresh)
- Error handling built-in

### Helius API
Our gateway to Solana data. One API call gives us:
- All token balances
- Token metadata (name, symbol, logo)
- Current prices
- Native SOL balance

---

## Architecture: How The Pieces Fit Together

```
┌─────────────────────────────────────────────────────────┐
│                      App Structure                       │
├─────────────────────────────────────────────────────────┤
│  app/                                                    │
│  ├── (tabs)/           ← Tab-based navigation           │
│  │   ├── index.tsx     ← Portfolio tab (default)        │
│  │   ├── skr.tsx       ← SKR staking tab                │
│  │   └── settings.tsx  ← Settings tab                   │
│  └── _layout.tsx       ← Root layout                    │
├─────────────────────────────────────────────────────────┤
│  features/             ← Feature-based organization      │
│  ├── portfolio/        ← Holdings, charts, add token    │
│  ├── skr/              ← Staking, APY calculator        │
│  └── settings/         ← Watched wallets modal          │
├─────────────────────────────────────────────────────────┤
│  stores/               ← Global state (Zustand)          │
│  ├── portfolio-store   ← Token holdings                  │
│  ├── skr-store         ← Staking state                  │
│  ├── custom-tokens     ← Manually added tokens          │
│  └── watched-wallets   ← Multi-wallet addresses         │
├─────────────────────────────────────────────────────────┤
│  constants/            ← Config & theming                │
│  ├── theme.ts          ← Colors, typography, spacing    │
│  ├── app-config.ts     ← API keys, known tokens         │
│  └── mock-data.ts      ← Demo mode data                 │
└─────────────────────────────────────────────────────────┘
```

---

## The Design System: Liquid Glass

We're using an **iOS 18-inspired "liquid glass" aesthetic**:

```typescript
// The core glass effect
glassBg: 'rgba(255, 255, 255, 0.08)'
glassBorder: 'rgba(255, 255, 255, 0.15)'
```

Key principles:
1. **Dark theme** - Black background, subtle glass cards
2. **Accent colors** - Green for gains, red for losses, purple for SKR
3. **Smooth animations** - Everything fades and slides with Reanimated
4. **Haptic feedback** - Taps feel satisfying on real devices

---

## Features We Built Today

### 1. Gradient Stake Button (SKR Tab)
**The Problem:** The plain white "Stake" button was boring.

**The Solution:** Solana's signature purple-to-green gradient:
```tsx
<LinearGradient
  colors={[colors.solanaGradientStart, colors.solanaGradientEnd]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
>
  <Pressable>Stake</Pressable>
</LinearGradient>
```

### 2. Projected Earnings Chart
**The Problem:** Users couldn't visualize their staking returns.

**The Solution:** An area chart showing projections at 1M, 3M, 6M, 12M:
- Uses `react-native-svg` for the chart
- Purple gradient fill matching SKR branding
- Calculates based on current APY and staked amount

### 3. Manual Token Addition
**The Problem:** Helius only shows tokens you actually hold. Pre-launch tokens or tokens on other chains don't appear.

**The Solution:** An "Add Token" flow:
1. User enters mint address
2. We fetch metadata from Helius
3. User can optionally set a manual balance/price
4. Token appears in their portfolio

**Key insight:** We merge custom tokens with API holdings, filtering duplicates.

### 4. Watch-Only Multi-Wallet
**The Problem:** Whales have multiple wallets. They want to see their total portfolio.

**The Solution:**
- Add wallet addresses in Settings
- Toggle "Combined View" to aggregate holdings
- Badge shows "X wallets" in portfolio header

**Key insight:** We fetch all wallets in parallel with `Promise.all()` for speed.

---

## Lessons Learned (AKA Future Pitfalls to Avoid)

### 1. Web Mode Limitations
The app needs `useMobileWallet()` from `@wallet-ui/react-native-kit`. On web, this returns null, so we guard it:
```typescript
const wallet = isWeb ? null : useMobileWallet()
```

**Lesson:** Always test on real device for wallet features.

### 2. State Dependencies in React Query
When adding multi-wallet support, the query key needed to include all dependencies:
```typescript
queryKey: ['portfolio', address, watchedAddresses, aggregateMode]
```

**Lesson:** If your data depends on state, include that state in the query key.

### 3. Store Updates Need All Consumers Updated
Adding `walletCount` to `portfolio-store` meant updating:
- The store interface
- The initial state
- The clear function
- The hook that calls `setWalletCount`

**Lesson:** State additions cascade. Think through all consumers.

### 4. LinearGradient Needs Wrapper Styling
The gradient component needs its own borderRadius, not the child:
```tsx
// Wrong - radius on Pressable doesn't clip gradient
<LinearGradient><Pressable style={{borderRadius: 12}}>

// Right - radius on gradient wrapper
<LinearGradient style={{borderRadius: 12, overflow: 'hidden'}}>
```

---

## Demo Mode: The Secret Weapon

For hackathon demos, we have `DEMO_MODE = true` in `mock-data.ts`:
- Impressive $238K portfolio
- 850K SKR tokens
- Realistic price history for sparklines
- Staking rewards accumulating

This means you can demo without connecting a real wallet.

---

## What's Next?

Potential improvements for the hackathon:
1. **Transaction history** - Show recent swaps, stakes, transfers
2. **Price alerts** - Notify when tokens hit target prices
3. **NFT gallery** - Show collectibles alongside tokens
4. **DeFi positions** - Show Raydium LPs, Kamino vaults

---

## File Reference

### New Files (Created Today)
| File | Purpose |
|------|---------|
| `features/skr/projected-earnings-chart.tsx` | SVG area chart for staking projections |
| `stores/custom-tokens-store.ts` | Zustand store for manually added tokens |
| `features/portfolio/token-metadata-service.ts` | Helius API for token lookups |
| `features/portfolio/add-token-modal.tsx` | Modal UI for adding tokens |
| `stores/watched-wallets-store.ts` | Zustand store for watched addresses |
| `features/settings/add-watched-wallet-modal.tsx` | Modal UI for adding wallets |

### Modified Files
| File | Changes |
|------|---------|
| `features/skr/staking-card.tsx` | Added gradient stake button |
| `features/skr/apy-calculator.tsx` | Integrated earnings chart |
| `features/portfolio/use-portfolio-data.tsx` | Custom tokens + multi-wallet fetching |
| `features/portfolio/holdings-list.tsx` | Add token button |
| `features/portfolio/portfolio-header.tsx` | Wallet count badge |
| `stores/portfolio-store.ts` | Added `isCustom` flag, `walletCount` |
| `app/(tabs)/settings.tsx` | Watched wallets section |

---

## The Bigger Picture

This isn't just a portfolio tracker - it's a **proof of concept** for what native Solana Mobile apps should feel like:
- Premium design that rivals iOS apps
- Deep integration with Solana ecosystem
- Features that make sense for mobile-first users

You're building the future of mobile crypto. Let's win that hackathon.

---

*Document created: Feb 4, 2026*
*Session: Fullport UX Features Implementation*
