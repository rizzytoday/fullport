---
title: Portfolio History Chart Intervals All Show Same Data
category: logic-errors
date: 2026-02-06
tags: [chart, portfolio-history, mock-data, intervals, time-series]
---

# Portfolio History Chart Intervals All Show Same Data

## Symptom

Portfolio history chart time period buttons (1D, 1W, 1M, 3M, 1Y, ALL) all displayed the same data. 1D showed no data at all.

## Investigation

1. Chart component logic looked correct - filtering by timestamp
2. Checked `getSnapshots(period)` function - working as expected
3. Found the issue in mock data generation

## Root Cause

Mock data only generated 30 days of **daily** snapshots:

```typescript
// Old code - only 30 daily snapshots
for (let d = 0; d <= 30; d++) {
  const timestamp = thirtyDaysAgo + d * day
  // ...
}
```

Problems:
- **1Y, ALL, 3M** all showed 30 days because that's all that existed
- **1D** showed nothing because there were no hourly data points (only 1 snapshot per day)

## Solution

Generate a full year of daily data PLUS hourly data for the last 24 hours:

```typescript
function generatePortfolioHistory() {
  const history = []
  const oneYearAgo = now - 365 * day

  // Generate daily snapshots for 365 days
  for (let d = 0; d <= 365; d++) {
    const timestamp = oneYearAgo + d * day
    // ... daily snapshot
    history.push({ timestamp, totalValue, ... })
  }

  // Add hourly snapshots for the last 24 hours (for 1D view)
  const yesterdayValue = history[history.length - 2]?.totalValue
  for (let h = 1; h < 24; h++) {
    const timestamp = now - (24 - h) * hour
    // ... hourly snapshot with small fluctuations
    history.push({ timestamp, totalValue, ... })
  }

  // Sort by timestamp
  return history.sort((a, b) => a.timestamp - b.timestamp)
}
```

Key insight: Different time intervals need different data granularity:
- **1D**: Hourly points (24 points)
- **1W**: Daily points (7 points)
- **1M+**: Daily points (30+ points)

## Prevention

When building time-series charts with multiple intervals:
1. Generate mock data that covers the longest interval (1Y/ALL)
2. Generate higher-frequency data for short intervals (hourly for 1D)
3. Test each interval button during development
4. Consider showing "No data" instead of empty chart when data is insufficient

## Related

- `/Users/zen/fullport/constants/mock-data.ts` - `generatePortfolioHistory()`
- `/Users/zen/fullport/features/portfolio/portfolio-history-chart.tsx`
- `/Users/zen/fullport/stores/portfolio-history-store.ts`
