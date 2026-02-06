---
title: Confusing Stats Without Clear Units (SKR vs USD)
category: ui-bugs
date: 2026-02-06
tags: [ux, units, formatting, skr, staking, clarity]
---

# Confusing Stats Without Clear Units (SKR vs USD)

## Symptom

Staking card showed:
- Pending: +2850
- Earned: 1.6K

User asked: "is that SKR? is that dollars??" - completely unclear what the numbers represent.

## Investigation

Looked at the stats row in `staking-card.tsx` - numbers were displayed without any unit labels.

## Root Cause

Stats were showing raw numbers without context:

```tsx
<View style={styles.statItem}>
  <Text style={styles.statLabel}>Pending</Text>
  <Text style={styles.statValue}>+2850</Text>
  {/* No unit! */}
</View>
```

Users can't tell if 2850 means $2,850 or 2,850 SKR tokens.

## Solution

Always show units explicitly. For crypto stats, show the primary value (USD) with token amount as secondary:

```tsx
<View style={styles.statItem}>
  <Text style={styles.statLabel}>Earned</Text>
  <Text style={[styles.statValue, styles.earnedText]}>
    ${totalEarnedUsd >= 1000 ? `${(totalEarnedUsd / 1000).toFixed(1)}K` : totalEarnedUsd.toFixed(0)}
  </Text>
  <Text style={[styles.statUnit, styles.earnedText]}>
    {totalEarned >= 1000 ? `${(totalEarned / 1000).toFixed(1)}K` : totalEarned.toFixed(0)} SKR
  </Text>
</View>
```

Style for the unit label:

```typescript
statUnit: {
  fontSize: 10,
  fontWeight: '500',
  color: colors.textMuted,
  marginTop: -2,
},
```

## Prevention

- **Rule**: Every numeric value should have a unit or prefix ($, %, SKR, etc.)
- **Pattern**: For crypto amounts, show USD as primary (larger), token amount as secondary (smaller, muted)
- **Test**: Read stats out loud - if you can't tell the unit, add it

## Related

- `/Users/zen/fullport/features/skr/staking-card.tsx`
- UX best practice: Always label your axes/values
