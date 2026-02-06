---
title: SKR Tab Shows Different Value Than Portfolio Assets
category: ui-bugs
date: 2026-02-06
tags: [skr, portfolio, value-mismatch, staking, react-native, zustand]
---

# SKR Tab Shows Different Value Than Portfolio Assets

## Symptom

Portfolio assets screen shows SKR value as $24.23K, but SKR tab header shows $38.48K for the same token.

## Investigation

1. Checked mock data - values were correct
2. Compared SkrBalanceCard vs HoldingsList components
3. Found the calculation difference in `skr-balance-card.tsx`

## Root Cause

The SKR tab was calculating `totalValue` as **available + staked** SKR:

```typescript
const totalSkr = uiBalance + (staking?.stakedUiAmount ?? 0)
const totalValue = valueUsd
  ? valueUsd + (staking?.stakedUiAmount ?? 0) * (priceUsd ?? 0)
  : null
```

While the portfolio assets view only shows the **holding value** (what's in the wallet, not staked).

The header sparkline was using `totalValue` instead of just the portfolio holding value.

## Solution

Use the portfolio holding value for the header to match assets view:

```typescript
// Get SKR price history and 24h change from portfolio holdings
const skrHolding = holdings.find(h => h.mint === SKR_CONFIG.mint)

// Header shows just portfolio holding value (not staked) to match assets view
const headerValue = skrHolding?.valueUsd ?? valueUsd
```

Then in the render:

```tsx
<Text style={styles.headerValue}>{formatUsd(headerValue)}</Text>
```

The main balance section can still show total (available + staked) since that's the full SKR position context.

## Prevention

- When showing the same data in multiple places, source it from the same store/calculation
- Document which value represents what (holding vs total position)
- Consider creating a single `useSkrValues()` hook that returns both `holdingValue` and `totalValue` with clear naming

## Related

- `/Users/zen/fullport/features/skr/skr-balance-card.tsx`
- `/Users/zen/fullport/stores/skr-store.ts`
- `/Users/zen/fullport/stores/portfolio-store.ts`
