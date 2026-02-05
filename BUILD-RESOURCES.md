# Fullport Build Resources

## Quick Reference

### Development Build (Android)
```bash
# Requires Java 17
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
npx expo run:android
```

### Start Dev Server
```bash
npx expo start --dev-client
```

## Key Resources

### Solana Mobile Documentation
- **Docs**: https://docs.solanamobile.com/ (add `.md` to any URL for raw markdown)
- **Seeker Wallet**: https://docs.solanamobile.com/seeker/seeker-wallet
- **Mobile Wallet Adapter**: https://docs.solanamobile.com/react-native/mobile-wallet-adapter

### Reference Repositories

#### beeman/solana-mobile-monorepo (NEW - Feb 2026)
https://github.com/beeman/solana-mobile-monorepo

Opinionated full-stack starter kit for Solana Mobile development.

**Tech Stack:**
- Runtime: Bun + Turborepo
- Mobile: React Native + Expo + Mobile Wallet Adapter + heroui-native
- Web: React + TanStack Start
- Backend: Hono + oRPC (type-safe APIs)
- Database: SQLite/Turso + Drizzle ORM
- Auth: Better-Auth with "Sign in with Solana"

**Structure:**
```
apps/
  native/    # Mobile app
  web/       # Web frontend
  server/    # Hono backend
packages/
  api/       # Shared API routes
  auth/      # Authentication logic
  db/        # Database schemas
  env/       # Environment validation
  rpc/       # Solana RPC utilities
```

**Key Patterns:**
- Type-safe backend-frontend communication via oRPC
- Shared TypeScript packages across apps
- Wallet integration (Phantom, Solflare, Backpack, Jupiter, Seeker)
- Configurable RPC endpoints (devnet/mainnet)

#### solana-mobile/mobile-wallet-adapter
https://github.com/solana-mobile/mobile-wallet-adapter

Official MWA implementation.

#### @wallet-ui/react-native-kit
Our current wallet UI library for React Native.

## Build Requirements

### Android
- Java 17 (OpenJDK)
- Android Studio with SDK 34
- Android emulator or device

### Java Setup (macOS)
```bash
brew install openjdk@17
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
```

### Native Modules Used
These require a development build (not Expo Go):
- `@react-native-community/netinfo` - Network status
- `expo-notifications` - Push notifications
- `react-native-quick-crypto` - Crypto operations
- `@solana-mobile/mobile-wallet-adapter-protocol` - MWA

## MONOLITH Hackathon
- **Prize Pool**: $125K+
- **Track**: Solana Seeker
- **Submission**: Week 5 (Sprint Week)

## App Architecture

### State Management
- Zustand stores with AsyncStorage persistence
- Separate stores for: portfolio, SKR staking, alerts, settings, wallets

### Key Features
- Multi-wallet portfolio tracking
- SKR token staking with APY projections
- Price alerts and notifications
- Watched wallets (track other addresses)
- Token discovery and management
