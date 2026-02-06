import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing } from '@/constants/app-styles'
import { usePortfolioStore, TokenHolding } from '@/stores/portfolio-store'
import { useSkrStore } from '@/stores/skr-store'
import { SKR_CONFIG } from '@/constants/app-config'
import { useMemo } from 'react'
import Animated, { FadeIn } from 'react-native-reanimated'

// Insight colors matching the pie chart palette
const INSIGHT_COLORS = {
  performance: '#4ade80', // green
  warning: '#f87171',     // red
  staking: '#a855f7',     // purple (SKR color)
  diversification: '#f59e0b', // amber
  opportunity: '#3b82f6', // blue
  milestone: '#06b6d4',   // cyan
}

type InsightType = keyof typeof INSIGHT_COLORS

interface Insight {
  id: string
  type: InsightType
  text: string
  priority: number
}

function formatUsd(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toLocaleString()
}

function generateInsights(
  holdings: TokenHolding[],
  totalValue: number,
  stakingInfo: { stakedAmount: number; pendingRewards: number } | null,
  skrPrice: number | null
): Insight[] {
  const insights: Insight[] = []

  if (!holdings.length || totalValue === 0) return insights

  // Calculate portfolio 24h change
  const change24h = holdings.reduce((sum, h) => {
    const weight = (h.valueUsd || 0) / totalValue
    return sum + (h.change24h || 0) * weight
  }, 0)

  // Find best and worst performers
  const withChanges = holdings.filter(h => h.change24h !== null && h.change24h !== 0)
  const sorted = [...withChanges].sort((a, b) => (b.change24h || 0) - (a.change24h || 0))
  const bestPerformer = sorted[0]
  const worstPerformer = sorted[sorted.length - 1]

  // SOL performance comparison
  const solHolding = holdings.find(h => h.symbol === 'SOL')
  const solChange = solHolding?.change24h || 0

  // 1. Portfolio performance
  if (Math.abs(change24h) > 0.5) {
    const direction = change24h > 0 ? 'up' : 'down'
    const diff = change24h - solChange
    let text = `Portfolio ${direction} ${Math.abs(change24h).toFixed(1)}% today`
    if (Math.abs(diff) > 1) {
      text += diff > 0 ? `, beating SOL by ${diff.toFixed(1)}%` : ``
    }
    insights.push({
      id: 'portfolio-perf',
      type: change24h > 0 ? 'performance' : 'warning',
      text,
      priority: 9,
    })
  }

  // 2. Best performer shoutout
  if (bestPerformer && (bestPerformer.change24h || 0) > 3) {
    insights.push({
      id: 'best-performer',
      type: 'performance',
      text: `${bestPerformer.symbol} leading today +${bestPerformer.change24h?.toFixed(1)}%`,
      priority: 7,
    })
  }

  // 3. Worst performer alert
  if (worstPerformer && (worstPerformer.change24h || 0) < -3) {
    insights.push({
      id: 'worst-performer',
      type: 'warning',
      text: `${worstPerformer.symbol} down ${Math.abs(worstPerformer.change24h || 0).toFixed(1)}% today`,
      priority: 6,
    })
  }

  // 4. Concentration check
  const topHolding = holdings.reduce((max, h) =>
    (h.valueUsd || 0) > (max.valueUsd || 0) ? h : max
  )
  const topPercent = ((topHolding.valueUsd || 0) / totalValue) * 100

  if (topPercent > 60) {
    insights.push({
      id: 'concentration',
      type: 'diversification',
      text: `${topPercent.toFixed(0)}% concentrated in ${topHolding.symbol}`,
      priority: 8,
    })
  } else if (holdings.length >= 4) {
    insights.push({
      id: 'diversified',
      type: 'performance',
      text: `Well diversified across ${holdings.length} assets`,
      priority: 3,
    })
  }

  // 5. Unclaimed staking rewards
  if (stakingInfo && stakingInfo.pendingRewards > 0 && skrPrice) {
    const rewardsUi = stakingInfo.pendingRewards / Math.pow(10, SKR_CONFIG.decimals)
    const rewardsUsd = rewardsUi * skrPrice
    if (rewardsUsd >= 0.5) {
      insights.push({
        id: 'unclaimed-rewards',
        type: 'staking',
        text: `${formatNumber(rewardsUi)} SKR (${formatUsd(rewardsUsd)}) rewards ready to claim`,
        priority: 10,
      })
    }
  }

  // 6. Staking earnings rate
  if (stakingInfo && stakingInfo.stakedAmount > 0 && skrPrice) {
    const stakedUi = stakingInfo.stakedAmount / Math.pow(10, SKR_CONFIG.decimals)
    const monthlyRewards = (stakedUi * SKR_CONFIG.currentApy) / 12
    const monthlyUsd = monthlyRewards * skrPrice
    if (monthlyUsd >= 1) {
      insights.push({
        id: 'staking-earnings',
        type: 'staking',
        text: `Earning ~${formatUsd(monthlyUsd)}/month from staked SKR`,
        priority: 5,
      })
    }
  }

  // 7. Unstaked SKR opportunity
  const skrHolding = holdings.find(h => h.mint === SKR_CONFIG.mint)
  if (skrHolding && skrHolding.uiAmount > 1000 && (!stakingInfo || stakingInfo.stakedAmount === 0)) {
    const potential = skrHolding.uiAmount * SKR_CONFIG.currentApy
    const potentialUsd = skrPrice ? potential * skrPrice : 0
    insights.push({
      id: 'stake-opportunity',
      type: 'opportunity',
      text: `Stake SKR to earn ~${formatUsd(potentialUsd)}/year at ${(SKR_CONFIG.currentApy * 100).toFixed(0)}% APY`,
      priority: 8,
    })
  }

  // 8. Price milestones
  if (solHolding && solHolding.priceUsd) {
    const price = solHolding.priceUsd
    if (price >= 95 && price <= 105) {
      insights.push({
        id: 'sol-milestone',
        type: 'milestone',
        text: `SOL approaching $100 milestone`,
        priority: 4,
      })
    }
  }

  // 9. Large portfolio milestone
  if (totalValue >= 100000) {
    const milestone = totalValue >= 500000 ? '500K' : totalValue >= 250000 ? '250K' : '100K'
    insights.push({
      id: 'portfolio-milestone',
      type: 'milestone',
      text: `Portfolio above $${milestone} 🎯`,
      priority: 2,
    })
  }

  // 10. Token count
  if (holdings.length >= 6) {
    insights.push({
      id: 'token-count',
      type: 'diversification',
      text: `Tracking ${holdings.length} tokens in your portfolio`,
      priority: 1,
    })
  }

  // Sort by priority and return top insights
  return insights.sort((a, b) => b.priority - a.priority).slice(0, 4)
}

export function AIInsights() {
  const { holdings, totalValueUsd } = usePortfolioStore()
  const { priceUsd, staking } = useSkrStore()

  const insights = useMemo(() => {
    const stakingData = staking ? {
      stakedAmount: staking.stakedAmount,
      pendingRewards: staking.pendingRewards,
    } : null
    return generateInsights(holdings, totalValueUsd, stakingData, priceUsd)
  }, [holdings, totalValueUsd, staking, priceUsd])

  if (insights.length === 0) return null

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <Text style={styles.header}>Insights</Text>
      <View style={styles.list}>
        {insights.map((insight) => (
          <View key={insight.id} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: INSIGHT_COLORS[insight.type] }]} />
            <Text style={styles.text}>{insight.text}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  header: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
})
