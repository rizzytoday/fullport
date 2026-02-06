import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing } from '@/constants/app-styles'
import { usePortfolioStore, TokenHolding } from '@/stores/portfolio-store'
import { useSkrStore } from '@/stores/skr-store'
import { SKR_CONFIG } from '@/constants/app-config'
import { useMemo } from 'react'
import Animated, { FadeIn } from 'react-native-reanimated'

interface Insight {
  id: string
  text: string
  priority: number
}

function generateInsights(
  holdings: TokenHolding[],
  totalValue: number,
  stakingInfo: { stakedAmount: number; pendingRewards: number } | null,
  skrPrice: number | null
): Insight[] {
  const insights: Insight[] = []

  if (!holdings.length || totalValue === 0) return insights

  // Portfolio 24h change
  const change24h = holdings.reduce((sum, h) => {
    const weight = (h.valueUsd || 0) / totalValue
    return sum + (h.change24h || 0) * weight
  }, 0)

  // SOL performance comparison
  const solHolding = holdings.find(h => h.symbol === 'SOL')
  const solChange = solHolding?.change24h || 0

  if (change24h !== 0) {
    const diff = change24h - solChange
    if (Math.abs(diff) > 1) {
      const direction = change24h > 0 ? 'up' : 'down'
      const vs = diff > 0 ? `outperforming SOL by ${diff.toFixed(1)}%` : `underperforming SOL by ${Math.abs(diff).toFixed(1)}%`
      insights.push({
        id: 'perf',
        text: `Portfolio ${direction} ${Math.abs(change24h).toFixed(1)}% today, ${vs}`,
        priority: 8,
      })
    }
  }

  // Concentration warning
  const topHolding = holdings.reduce((max, h) =>
    (h.valueUsd || 0) > (max.valueUsd || 0) ? h : max
  )
  const topPercent = ((topHolding.valueUsd || 0) / totalValue) * 100

  if (topPercent > 70) {
    insights.push({
      id: 'concentration',
      text: `${topPercent.toFixed(0)}% in ${topHolding.symbol} — consider diversifying`,
      priority: 9,
    })
  }

  // Unclaimed rewards
  if (stakingInfo && stakingInfo.pendingRewards > 0 && skrPrice) {
    const rewardsUi = stakingInfo.pendingRewards / Math.pow(10, SKR_CONFIG.decimals)
    const rewardsUsd = rewardsUi * skrPrice
    if (rewardsUsd >= 1) {
      insights.push({
        id: 'rewards',
        text: `${rewardsUi.toLocaleString()} SKR ($${rewardsUsd.toFixed(2)}) unclaimed rewards`,
        priority: 10,
      })
    }
  }

  // Unstaked SKR opportunity
  const skrHolding = holdings.find(h => h.mint === SKR_CONFIG.mint)
  if (skrHolding && skrHolding.uiAmount > 10000 && (!stakingInfo || stakingInfo.stakedAmount === 0)) {
    const potential = skrHolding.uiAmount * SKR_CONFIG.currentApy
    insights.push({
      id: 'stake',
      text: `Stake your SKR to earn ~${potential.toLocaleString()} SKR/year at ${(SKR_CONFIG.currentApy * 100).toFixed(0)}% APY`,
      priority: 7,
    })
  }

  return insights.sort((a, b) => b.priority - a.priority).slice(0, 3)
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
            <View style={styles.dot} />
            <Text style={styles.text}>{insight.text}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  header: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginTop: 7,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
})
