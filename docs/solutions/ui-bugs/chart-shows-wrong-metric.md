---
title: Chart Shows Total Value Instead of Rewards
category: ui-bugs
date: 2026-02-06
tags: [chart, rewards, staking, ux, misleading-data, projected-earnings]
---

# Chart Shows Total Value Instead of Rewards

## Symptom

"PROJECTED REWARDS" chart shows values like `$38.5K → $46.6K` instead of starting from $0. Users expect a rewards chart to show what they'll *earn*, not their total portfolio value over time.

The ~$8K growth matches the yearly rewards calculation below the chart, but this isn't obvious to users.

## Investigation

Reviewed the chart calculation logic:

```tsx
// Was calculating TOTAL VALUE (principal + rewards)
const projectedSkr = totalStaked * (1 + currentApy * yearFraction)
```

This compounds principal with rewards, which is technically correct for "projected value" but misleading when the section is titled "PROJECTED REWARDS".

## Root Cause

Semantic mismatch between UI label and data calculation. The chart was built to show projected portfolio value, but the section header says "PROJECTED REWARDS" — implying just the earnings portion.

## Solution

Change calculation to show only rewards earned, starting from $0:

```tsx
// Calculate REWARDS earned at each milestone (not total portfolio value)
const projections = MILESTONES.map(({ months }) => {
  const yearFraction = months / 12
  const rewardsSkr = totalStaked * currentApy * yearFraction  // Removed the (1 + ...)
  const rewardsUsd = priceUsd ? rewardsSkr * priceUsd : null
  return { months, skr: rewardsSkr, usd: rewardsUsd }
})

// Start from $0 (no rewards earned yet)
const values = [0, ...projections.map((p) => p.usd ?? 0)]
```

Also update the format function to show `$0` instead of `--` for zero:

```tsx
const formatUsd = (value: number | null) => {
  if (value === null) return '--'
  if (value === 0) return '$0'  // Was: if (value === null || value === 0) return '--'
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}
```

## Prevention

- **Label-data alignment**: When naming a UI section, verify the underlying data matches the semantic meaning
- **User perspective**: Ask "what would a user expect to see?" before implementing
- **Review chart axes**: Starting point matters — $0 start implies accumulation, high start implies total value

## Related

- File: `features/skr/projected-earnings-chart.tsx`
- Pattern applies to any "earnings", "rewards", or "profit" chart — users expect these to start from zero
