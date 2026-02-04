# MONOLITH Hackathon - Complete Research Document

> **Purpose**: Single source of truth for all hackathon requirements, resources, and strategy.
> **Last Updated**: Feb 3, 2026

---

## Table of Contents
1. [Hackathon Overview](#hackathon-overview)
2. [Requirements & Rules](#requirements--rules)
3. [Judging Criteria](#judging-criteria)
4. [Prize Structure](#prize-structure)
5. [Technical Requirements](#technical-requirements)
6. [Official Resources](#official-resources)
7. [SKR Token Details](#skr-token-details)
8. [Competitor Analysis](#competitor-analysis)
9. [Key Dates](#key-dates)

---

## Hackathon Overview

**Name**: MONOLITH - Solana Mobile Hackathon
**Organizers**: Solana Mobile & RadiantsDAO
**Website**: https://solanamobile.radiant.nexus/

### Quick Stats
- **Duration**: 5 weeks (Feb 2 - Mar 9, 2026)
- **Prize Pool**: $125,000+
- **Bonus Track**: $10,000 in SKR
- **Winners**: 10 main ($10K each) + 5 honorable mentions ($5K each)
- **Device**: Solana Seeker (150,000+ shipped)

---

## Requirements & Rules

### Eligibility

| Rule | Details |
|------|---------|
| **Project Age** | Must have started within 3 months of hackathon launch |
| **Funding** | Projects with outside capital are NOT eligible |
| **Pre-existing** | Allowed if significant NEW mobile development during hackathon |
| **Web Apps** | Can participate but must build Android app with significant mobile-specific dev |
| **PWA/Ports** | Direct ports or minimal conversions will score POORLY |

### What You Must Build
From RadiantsDAO Twitter:
- Produce a **functional APK**
- Integrate **Solana Mobile Stack & Mobile Wallet Adapter**
- Build for **mobile from the ground up** (PWA/direct ports score poorly)
- Interact **meaningfully with Solana Network**

### Submission Requirements

| Item | Required |
|------|----------|
| **APK** | Functional Android APK |
| **GitHub** | Repository with source code |
| **Demo Video** | Showcasing app functionality |
| **Pitch Deck** | Or brief presentation explaining the app |

### Prize Eligibility Note
- Publishing on dApp Store NOT required by submission deadline
- Winners MUST publish to claim prize (given reasonable timeframe after results)

### Disqualification
- Lying on registration/submission forms
- Violating any rules
- Forfeits all prizes

---

## Judging Criteria

### Evaluation Process
Judges assess:
1. Completion based on demo video
2. Technical depth based on GitHub commits
3. Mobile-optimized UX and usage of mobile features
4. Usage and interaction with Solana network
5. Clarity and vision from presentation

### Scoring Breakdown

| Category | Weight | What They Look For |
|----------|--------|-------------------|
| **Stickiness & PMF** | 25% | Does it resonate with Seeker community? Creates habits? Drives daily engagement? |
| **User Experience** | 25% | Intuitive, polished, enjoyable to use? |
| **Innovation/X-Factor** | 25% | Novel and creative? Stands out from existing products? |
| **Presentation & Demo** | 25% | Clear communication? Demo effectively showcases core concept? |

### Judges
- **Toly** (Anatoly Yakovenko) - Solana Labs
- **Emmett** - General Manager, Solana Mobile
- **Mert** - Helius
- **Mike S** - Developer Relations, Solana Mobile
- **Chase** - Solana Mobile
- **Akshay** - BD & Ecosystem, Solana Mobile / Solana Labs

---

## Prize Structure

### Main Prizes
| Tier | Count | Amount |
|------|-------|--------|
| Winners | 10 | $10,000 USD each |
| Honorable Mentions | 5 | $5,000 USD each |

### Bonus Track
- **SKR Integration**: $10,000 in SKR
- Requirement: Integrate SKR meaningfully

### Additional Prizes
- Featured dApp Store placement (100,000+ eyeballs)
- Marketing & launch support from Solana Mobile
- Seeker devices for winning teams
- **Call with Toly** for winners & honorable mentions

---

## Technical Requirements

### Must Use
1. **Solana Mobile Stack**
2. **Mobile Wallet Adapter (MWA)**
3. **Android APK** (not PWA)

### Recommended Stack
```
Framework:        React Native (via Expo)
Template:         npm create solana-dapp@latest
Wallet:           @solana-mobile/mobile-wallet-adapter-protocol
Solana:           @solana/web3.js
```

### Create Project Command
```bash
npm create solana-dapp@latest
# Select: Solana Mobile framework
# Choose: React Native template
```

### Testing Without Seeker
- Can test on ANY Android device
- Use Android Emulator
- MWA works with Phantom, Solflare on any Android

### Key Integrations
- Mobile Wallet Adapter for wallet connection
- Seed Vault for Seeker-specific features
- Helius RPC for fast Solana access
- Jupiter API for token prices

---

## Official Resources

### Primary Links
| Resource | URL |
|----------|-----|
| Hackathon Site | https://solanamobile.radiant.nexus/ |
| Registration | https://align.nexus/organizations/8b216ce8-dd0e-4f96-85a1-0d95ba3022e2/hackathons/6unDGXkWmY1Yw99SsKMt6pPCQTpSSQh5kSiJRgqTwHXE |
| Discord | https://discord.gg/radiants |
| Twitter | https://x.com/SolanaMobile, https://x.com/RadiantsDAO |

### Documentation
| Resource | URL |
|----------|-----|
| Solana Mobile Docs | https://docs.solanamobile.com/ |
| Developer Overview | https://docs.solanamobile.com/developers/overview |
| Development Setup | https://docs.solanamobile.com/developers/development-setup |
| React Native Quickstart | https://docs.solanamobile.com/react-native/quickstart |
| Mobile Wallet Adapter | https://docs.solanamobile.com/mobile-wallet-adapter/overview |
| MWA for Mobile Apps | https://docs.solanamobile.com/mobile-wallet-adapter/mobile-apps |
| Sample Apps | https://docs.solanamobile.com/sample-apps/sample_app_overview |
| AI Toolkit | https://docs.solanamobile.com/developers/ai-toolkit |
| Test on Any Android | https://docs.solanamobile.com/react-native/test-with-any-android-device |

> **Pro Tip**: Add `.md` to any solana.com URL to get raw markdown (e.g., `solana.com/docs/core.md`)

### Publishing
| Resource | URL |
|----------|-----|
| dApp Store Overview | https://docs.solanamobile.com/dapp-publishing/intro |
| Publisher Policy | https://docs.solanamobile.com/dapp-publishing/publisher-policy |
| Publishing Portal | https://publish.solanamobile.com/ |
| Build APK with Expo | https://docs.solanamobile.com/dapp-publishing/building-expo-apk |

### Solana General
| Resource | URL |
|----------|-----|
| Solana Docs | https://solana.com/docs |
| Quick Start | https://solana.com/docs/intro/quick-start |
| Developer Cookbook | https://solana.com/developers/cookbook |
| web3.js GitHub | https://github.com/solana-foundation/solana-web3.js |

### React Native / Expo
| Resource | URL |
|----------|-----|
| Expo Docs | https://docs.expo.dev/ |
| Solana Mobile Expo Template | https://github.com/solana-mobile/solana-mobile-expo-template |

### Learning Resources
| Resource | URL |
|----------|-----|
| Blueshift Solana Mobile Mastery | https://learn.blueshift.gg/en/paths/solana-mobile-mastery |
| Solana YouTube Playlist | https://www.youtube.com/watch?v=pRYs49MqapI&list=PLilwLeBwGuK51Ji870apdb88dnBr1Xqhm |
| Bootcamp Playlist | https://www.youtube.com/watch?v=0P8JeL3TURU&list=PLilwLeBwGuK6NsYMPP_BlVkeQgff0NwvU |
| freeCodeCamp Solana | https://web3.freecodecamp.org/solana |
| RiseIn Solana Course | https://www.risein.com/courses/build-on-solana |
| RareSkills Tutorials | https://rareskills.io/tutorials/solana-tutorial |
| Solandy YouTube | https://www.youtube.com/solandy |

### Tooling & SDKs
| Resource | URL |
|----------|-----|
| Create Solana dApp | https://github.com/solana-foundation/create-solana-dapp |
| Solana Playground | https://beta.solpg.io/ |
| Solana App Kit | https://github.com/SendArcade/solana-app-kit |
| Stack Exchange | https://solana.stackexchange.com/ |
| Awesome Solana OSS | https://github.com/StockpileLabs/awesome-solana-oss |

### Game Development (Reference)
| Resource | URL |
|----------|-----|
| Game Examples | https://github.com/solana-developers/solana-game-examples |
| Unreal SDK | https://github.com/Bifrost-Technologies/Solana-Unreal-SDK |
| Godot SDK | https://github.com/Virus-Axel/godot-solana-sdk |
| Turbo | https://turbo.computer/ |

---

## SKR Token Details

### Overview
- **Name**: SKR (Seeker Token)
- **Type**: Native asset of Solana Mobile ecosystem
- **Launch**: January 21, 2026
- **Total Supply**: 10 billion SKR

### Tokenomics
| Allocation | Percentage |
|------------|------------|
| Airdrops | 30% |
| Growth & Partnerships | 25% |
| Liquidity & Launch | 10% |
| Community Treasury | 10% |
| Solana Mobile | 15% |
| Solana Labs | 10% |

### Staking & Inflation
- Initial inflation: 10% annually
- Decreases 25% yearly until 2% floor
- Rewards distributed every 48 hours
- Zero commission at launch

### Guardian System
- Similar to validators but for mobile ecosystem
- Responsibilities: verify devices, review dApps, ensure security
- First cohort: Helius, Jito, Anza, DoubleZero, Triton One
- Users delegate SKR to Guardians for rewards

### SKR Integration Opportunities
1. Display SKR balance in portfolio
2. Show staking status and rewards
3. Guardian selection/delegation UI
4. SKR price tracking
5. Rewards calculator
6. Staking history visualization

### SKR Resources
| Resource | URL |
|----------|-----|
| SKR Page | https://solanamobile.com/skr |
| Staking | https://stake.solanamobile.com |
| Blog Announcement | https://blog.solanamobile.com/post/skr-launches-january-2026 |

---

## Competitor Analysis

### Existing Solana Portfolio Solutions

#### Phantom Wallet
- **Type**: Wallet-first with basic tracking
- **Mobile**: Yes (native app)
- **Strengths**: Most popular, great UX, NFT support
- **Weaknesses**: Not portfolio-focused, basic analytics, no SKR staking UI
- **Gap for Fullport**: Dedicated portfolio analytics, SKR integration

#### Step Finance
- **Type**: Portfolio dashboard
- **Mobile**: Web-based (not mobile-optimized)
- **Strengths**: DeFi aggregation, comprehensive
- **Weaknesses**: No mobile app, web-first
- **Gap for Fullport**: Mobile-native experience

#### Solflare
- **Type**: Wallet with portfolio view
- **Mobile**: Yes
- **Strengths**: Staking support, clean UI
- **Weaknesses**: Wallet-first, not analytics-focused
- **Gap for Fullport**: Deep portfolio analytics

#### DeBank
- **Type**: Multi-chain portfolio tracker
- **Mobile**: Yes
- **Strengths**: Cross-chain, DeFi tracking
- **Weaknesses**: EVM-focused, limited Solana support
- **Gap for Fullport**: Solana-native, SKR integration

### Fullport Differentiators
1. **Portfolio-first** (not wallet-first)
2. **Seeker-optimized** (not generic Android)
3. **SKR deep integration** (unique)
4. **AI insights** (innovative)
5. **Mobile-native** (not web port)

---

## Key Dates

| Date | Event |
|------|-------|
| **Feb 2, 2026** | Hackathon starts |
| Feb 9 | End of Week 1 |
| Feb 16 | End of Week 2 |
| Feb 23 | End of Week 3 |
| Mar 2 | End of Week 4 |
| **Mar 9, 2026** | Submissions close |
| TBD | Results announced |
| TBD | dApp Store publication deadline for winners |

---

## Quick Reference Commands

### Project Setup
```bash
# Create new Solana Mobile project
npm create solana-dapp@latest

# Install Claude Code skills for Solana Mobile
npx skills add https://github.com/wallet-ui/wallet-ui --skill install-wallet-ui-react-native
```

### Development
```bash
# Start development
npx expo start

# Build APK
eas build --platform android --profile preview
```

### Testing
```bash
# Run on Android emulator
npx expo run:android

# Run on physical device
npx expo start --tunnel
```

---

## Notes & Reminders

### Do's
- Build mobile-first (not web port)
- Use Mobile Wallet Adapter
- Interact meaningfully with Solana
- Make UX polished and intuitive
- Integrate SKR for bonus track
- Focus on stickiness/daily use

### Don'ts
- Don't port existing web app directly
- Don't make minimal PWA wrapper
- Don't ignore mobile-specific features
- Don't submit without APK
- Don't miss the deadline

### Winning Formula
```
High Stickiness (portfolio = daily use)
+ Polished UX (Apple-quality)
+ SKR Integration (bonus track)
+ Clear Demo (show, don't tell)
= Top 10 Winner
```

---

## Contact & Support

- **Discord**: https://discord.gg/radiants (workshops, Q&A)
- **Twitter**: @SolanaMobile, @RadiantsDAO
- **Stack Exchange**: https://solana.stackexchange.com/
- **Solana Mobile Discord**: https://discord.gg/solanamobile
