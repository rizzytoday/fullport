# Fullport - Solana Seeker Portfolio App

## Hackathon: MONOLITH (Solana Mobile Hackathon)
- **Timeline**: Feb 2 - Mar 9, 2026 (5 weeks)
- **Prize Pool**: $125,000+
- **Bonus**: $10,000 SKR for best SKR integration

---

## Project Configuration

| Setting | Value |
|---------|-------|
| **Team** | Solo |
| **Design** | Liquid Glass (iOS 18 aesthetic) |
| **SKR Integration** | Full staking flow (maximize bonus track) |

---

## Executive Summary

**Fullport** is a mobile-first Solana portfolio tracker designed exclusively for Seeker users. Unlike generic portfolio trackers (Phantom, Step Finance, DeBank), Fullport is purpose-built for the Solana Mobile ecosystem with deep SKR integration, making it eligible for both the main prize ($10K) and the SKR bonus track ($10K in SKR).

### Why Portfolio App Will Win

1. **Gap in Market**: No dedicated mobile-first portfolio app in Solana dApp Store
   - Phantom = wallet with basic tracking
   - Step Finance = web dashboard, not mobile-optimized
   - DeBank = EVM-focused, limited Solana

2. **High Stickiness (25% of score)**: Portfolio apps are opened DAILY
   - Users check balances multiple times per day
   - Natural habit-forming behavior
   - High retention = high PMF

3. **SKR Bonus Track**: Perfect vehicle for SKR integration
   - Display SKR staking rewards
   - Track SKR price and portfolio allocation
   - Show Guardian delegation status
   - Calculate SKR earnings over time

---

## Judging Criteria Alignment

| Criteria | Weight | Strategy |
|----------|--------|----------|
| **Stickiness & PMF** | 25% | Daily use case - checking portfolio. Push notifications for price alerts, whale movements |
| **User Experience** | 25% | Apple-quality liquid glass UI, smooth animations, one-tap actions |
| **Innovation/X-Factor** | 25% | AI insights, SKR integration, Seeker-exclusive features |
| **Presentation & Demo** | 25% | Professional video, clear pitch deck, polished demo |

---

## Core Features (MVP for Hackathon)

### 1. Portfolio Dashboard
- **Total portfolio value** in USD/SOL
- **Asset breakdown** with pie chart
- **24h/7d/30d performance** with sparklines
- **Holdings list** with real-time prices
- Token logos, amounts, USD values

### 2. Wallet Connection (MWA)
- One-tap connect via Mobile Wallet Adapter
- Support Phantom, Solflare, Seed Vault
- Multi-wallet support (aggregate view)

### 3. SKR Integration (Bonus Track)
- **SKR balance** prominently displayed
- **Staking status**: staked amount, Guardian, rewards
- **SKR calculator**: project future earnings
- **Delegation UI**: quick-delegate to Guardians

### 4. Transaction History ✅
- All transactions with labels
- Token swaps, transfers, staking events
- Filter by type, date, token

### 5. Push Notifications
- Price alerts (SOL below/above X) ✅
- Staking reward notifications ✅
- New airdrop detection ✅

### 6. AI Insights (X-Factor) ✅
- "Your portfolio is up 12% this week, outperforming SOL by 3%"
- "You have unclaimed staking rewards worth $X"
- "Consider diversifying - 80% in single token"

---

## Technical Architecture

### Stack
```
Framework:    React Native (Expo SDK 52)
State:        Zustand
Navigation:   Expo Router
Wallet:       @solana-mobile/mobile-wallet-adapter-protocol
RPC:          Helius (fast, reliable)
Prices:       Jupiter Price API / Birdeye
UI:           Custom liquid glass components
Animations:   React Native Reanimated 3
```

### Key Dependencies
```json
{
  "@solana/web3.js": "^2.x",
  "@solana-mobile/mobile-wallet-adapter-protocol": "latest",
  "@solana-mobile/mobile-wallet-adapter-protocol-expo-plugin": "latest",
  "expo": "~52.0.0",
  "zustand": "^4.x",
  "react-native-reanimated": "~3.x"
}
```

### Data Flow
```
User Wallet → Helius RPC → Token Balances
                        → Transaction History
                        → Token Metadata

Jupiter API → Token Prices
           → Price History

SKR Staking → Staking Status
Program    → Guardian Info
           → Reward Calculations
```

---

## SKR Integration Details (Bonus Track)

### What Makes "Best SKR Integration"
1. **Display SKR Holdings**: Show SKR balance in portfolio
2. **Staking Visualization**: Graph of staked SKR over time
3. **Guardian Selection**: UI to choose/change Guardian
4. **Reward Tracking**: Calculate and display staking rewards
5. **Delegation Flow**: Initiate staking directly from app

### SKR Program Integration
```typescript
// SKR Staking Program (need to find actual program ID)
const SKR_STAKING_PROGRAM = new PublicKey("...");
const SKR_MINT = new PublicKey("...");

// Fetch staking account
async function getStakingInfo(wallet: PublicKey) {
  // Derive staking PDA
  // Fetch staking account data
  // Parse: stakedAmount, guardian, rewards
}
```

---

## Mobile-First Features (Not a Web Port)

These features prove mobile-first development:

1. **Biometric Auth**: Face ID / fingerprint for app access
2. **Widget**: Home screen widget showing portfolio value
3. **Haptic Feedback**: Tactile responses on interactions
4. **Pull to Refresh**: Native gesture for data refresh
5. **Swipe Actions**: Swipe on tokens for quick actions
6. **Dark Mode**: System-aware theming
7. **Offline Mode**: Cached data when no connection

---

## UI/UX Design (Liquid Glass Style)

Following CLAUDE.md design philosophy:

### Color Palette
```css
--bg-primary: rgb(0, 0, 0);
--bg-secondary: rgb(15, 15, 20);
--glass-bg: rgba(255, 255, 255, 0.08);
--glass-border: rgba(255, 255, 255, 0.15);
--accent-green: #4ade80;  /* gains */
--accent-red: #f87171;    /* losses */
--skr-purple: #a855f7;    /* SKR branding */
```

### Animation Principles
- **Smooth ease**: `cubic-bezier(0.4, 0, 0.2, 1)` for opacity, color
- **Bounce ease**: `cubic-bezier(0.34, 1.56, 0.64, 1)` for transforms
- Page transitions with shared element animations
- List items stagger in with 30ms delay each

---

## 5-Week Development Timeline

### Week 1 (Feb 2-8): Foundation ✅ COMPLETE
**Goal**: Working wallet connection + basic data fetch
- [x] Project setup with Expo + Solana Mobile template
- [x] Mobile Wallet Adapter integration (via @wallet-ui/react-native-kit)
- [x] Wallet connection working with Phantom on emulator
- [x] Core UI components (glass cards, buttons, navigation)
- [x] App shell with bottom tab navigation (Portfolio, SKR, History, Settings)
- [x] All tabs detect wallet connection state
- [x] Haptic feedback on interactions
- [x] Pull-to-refresh on all screens
- [x] Settings with biometric/haptic toggles
- [x] Disconnect wallet functionality

### Week 2 (Feb 9-15): Portfolio Core ✅ COMPLETE
**Goal**: Full portfolio dashboard with real prices
- [x] Token balance fetching via Helius DAS API (getAssetsByOwner)
- [x] Portfolio dashboard UI (total value, breakdown)
- [x] Holdings list with logos, amounts, values, % allocation badges
- [x] Pull-to-refresh, loading states (already done in Week 1)
- [x] Allocation pie chart (donut chart with legend)
- [x] Mission Progress gamification (segmented progress bar, goal tracking)
- [x] Token price history / sparkline charts (SVG sparklines with gradient fill)
- [x] Price alerts setup (bell icon on tokens, above/below targets, push notifications)

### Week 3 (Feb 16-22): SKR Integration (Critical for Bonus) ✅ COMPLETE
**Goal**: Complete SKR staking flow
- [x] Research SKR staking program (found all addresses!)
  - Mint: `SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3`
  - Staking Program: `SKRskrmtL83pcL4YqLWt6iPefDqwXQWHSw9S9vz94BZ`
  - Stake Vault: `8isViKbwhuhFhsv2t8vaFL74pKCqaFPQXo1KkeQwZbB8`
  - Primary Guardian: `SKRGdBwzb1AtFW2chhBnZpGFnFLj6Mi7HM7iwjXALvw`
- [x] Display SKR balance + price (SkrBalanceCard component)
- [x] Fetch staking status UI (StakingCard component with guardian, rewards, cooldown)
- [x] Guardian selection/delegation UI (GuardianSelectModal with 5 guardians)
- [x] SKR rewards calculator (ApyCalculator with daily/monthly/yearly projections)
- [x] Implement actual staking transactions via MWA
  - StakingModal with stake/unstake flows
  - Amount input with MAX/percentage buttons
  - Projected rewards display
  - Transaction submission via MWA sendTransaction
  - Success/error states with haptic feedback
- [x] Guardian selection modal (GuardianSelectModal)
  - List of 5 guardians with commission rates
  - Total staked amounts per guardian
  - Selection UI with confirmation
- [ ] Staking history visualization (nice-to-have)

### Week 4 (Feb 23-Mar 1): Polish & Mobile Features ✅ COMPLETE
**Goal**: Production-quality UX
- [x] Transaction history tab (10 mock transactions with all types)
- [x] Biometric auth (Face ID / fingerprint)
  - Lock screen with Fullport logo
  - Auto-authenticate on launch
  - Auto-lock after 5s in background
  - Settings toggle with hardware detection
- [x] Haptic feedback throughout
- [x] Smooth animations (Reanimated - FadeIn, stagger)
- [x] Error handling, empty states
  - Reusable EmptyState component
  - Reusable ErrorState component (inline + full variants)
  - Portfolio: zero tokens state, fetch error display
  - SKR: zero balance state with "Learn More" CTA
- [x] Offline caching
  - Data persisted via Zustand + AsyncStorage
  - Network status detection (NetInfo)
  - Offline banner when disconnected
  - "Last updated" timestamps in portfolio header
  - Stale data indicator (>5min old)

### Week 5 (Mar 2-9): Submission Sprint
**Goal**: Ship it!
- [ ] Bug fixes and final polish
- [ ] Demo video (3-5 min, show all features)
- [ ] Pitch deck (problem, solution, demo, SKR integration)
- [ ] APK release build
- [ ] Test on multiple Android devices
- [ ] Submit to Align.nexus before Mar 9

---

## Submission Requirements Checklist

- [x] **Functional APK**: Release build for Android
- [x] **GitHub Repo**: Public repository with source code — https://github.com/rizzytoday/fullport
- [ ] **Demo Video**: 3-5 min showcasing functionality
- [ ] **Pitch Deck**: Problem, solution, features, team

---

## Competitive Advantages

| Feature | Phantom | Step | Fullport |
|---------|---------|------|----------|
| Mobile-first | Wallet-first | Web-first | **Portfolio-first** |
| SKR integration | Basic | None | **Deep** |
| Seeker optimized | Generic | No | **Yes** |
| Push notifications | Transactions only | None | **Full suite** |
| AI insights | None | None | **Yes** |
| Guardian delegation | None | None | **Yes** |

---

## Risk Mitigation

1. **Scope Creep**: MVP is dashboard + SKR + notifications. Cut AI insights if needed.
2. **SKR Program**: If staking program details unavailable, display balance + price only
3. **Testing**: Use any Android device for testing (no Seeker required)
4. **API Limits**: Use Helius free tier (100K credits sufficient for demo)

---

## Post-Hackathon Roadmap (For Pitch)

- Multi-chain support (expand beyond Solana)
- DeFi position tracking (LP, lending positions)
- Tax reporting export
- Social features (share portfolio, compare with friends)
- Premium tier with advanced analytics

---

## Resources Gathered

### Official Docs
- Solana Mobile Docs: https://docs.solanamobile.com/
- React Native Quickstart: https://docs.solanamobile.com/react-native/quickstart
- Mobile Wallet Adapter: https://docs.solanamobile.com/mobile-wallet-adapter/overview
- Sample Apps: https://docs.solanamobile.com/sample-apps/sample_app_overview
- AI Toolkit: https://docs.solanamobile.com/developers/ai-toolkit

### SKR Info
- SKR launched Jan 2026
- 10B total supply
- 30% airdrop allocation
- Staking with Guardians (Helius, Jito, etc.)
- 10% initial inflation, decreasing yearly

---

## NULL SECTOR Inspiration (Seeker Founder's Vision)

Screenshots from Chaseeb's (Seeker founder) portfolio app attempt. This is what HE wanted:

### Key Features to Consider
1. **Mission Progress** - Gamified goal tracking (target: $10M) with segmented progress bar
2. **Projected Value** - Include vesting/locked tokens in future value
3. **% Allocation** - Show each token's % of total portfolio
4. **Energy Allocation** - Pie charts by category (Crypto, Stocks, Yield, Cash)
5. **Time Locks** - Display vesting schedules
6. **Supply Lines** - Income sources tracking
7. **Burn Rate** - Expense tracking
8. **Monthly Surplus** - Net income calculation

### Design Notes
- Cyberpunk/terminal aesthetic with neon colors
- Segmented progress bars
- Table-based asset lists
- Color coding: cyan for titles, green/pink for values

### Priority for MVP
1. ✅ Portfolio with token list
2. ✅ % allocation per token (purple badges on each holding)
3. ✅ Simple pie chart for allocation (donut chart with legend)
4. ✅ Goal/target feature (gamification - Mission Progress with segmented bar)
5. ✅ SKR staking integration (full stake/unstake, guardian selection, rewards projection)

---

## Research Document

Full hackathon research saved at: `/Users/zen/fullport/HACKATHON_RESEARCH.md`
