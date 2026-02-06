import { View, Text, StyleSheet, Pressable } from 'react-native'
import { colors, spacing } from '@/constants/app-styles'
import { usePortfolioStore, TokenHolding } from '@/stores/portfolio-store'
import { useSkrStore } from '@/stores/skr-store'
import { SKR_CONFIG } from '@/constants/app-config'
import { useMemo, useState } from 'react'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

const isWeb = Platform.OS === 'web'

interface Insight {
  id: string
  type: 'performance' | 'diversification' | 'staking' | 'opportunity' | 'alert'
  icon: string
  title: string
  body: string
  priority: number // Higher = more important
}

// Generate insights based on portfolio data
function generateInsights(
  holdings: TokenHolding[],
  totalValue: number,
  stakingInfo: { stakedAmount: number; pendingRewards: number } | null,
  skrPrice: number | null
): Insight[] {
  const insights: Insight[] = []

  if (!holdings.length || totalValue === 0) return insights

  // Calculate portfolio metrics
  const change24h = holdings.reduce((sum, h) => {
    const weight = (h.valueUsd || 0) / totalValue
    return sum + (h.change24h || 0) * weight
  }, 0)

  // Find best and worst performers
  const sorted = [...holdings].sort((a, b) => (b.change24h || 0) - (a.change24h || 0))
  const bestPerformer = sorted[0]
  const worstPerformer = sorted[sorted.length - 1]

  // Calculate SOL performance for comparison
  const solHolding = holdings.find(h => h.symbol === 'SOL')
  const solChange = solHolding?.change24h || 0

  // 1. Performance insight
  if (change24h !== 0) {
    const outperformSol = change24h > solChange
    if (change24h > 0) {
      insights.push({
        id: 'perf-up',
        type: 'performance',
        icon: '📈',
        title: 'Portfolio Up Today',
        body: `Your portfolio is up ${change24h.toFixed(1)}% in 24h${outperformSol ? `, outperforming SOL by ${(change24h - solChange).toFixed(1)}%` : ''}.`,
        priority: 8,
      })
    } else {
      insights.push({
        id: 'perf-down',
        type: 'performance',
        icon: '📉',
        title: 'Market Dip',
        body: `Your portfolio is down ${Math.abs(change24h).toFixed(1)}% today. ${outperformSol ? 'Still beating SOL though!' : 'Consider it a buying opportunity.'}`,
        priority: 7,
      })
    }
  }

  // 2. Best performer shoutout
  if (bestPerformer && (bestPerformer.change24h || 0) > 5) {
    insights.push({
      id: 'best-performer',
      type: 'performance',
      icon: '🏆',
      title: `${bestPerformer.symbol} Leading`,
      body: `${bestPerformer.symbol} is your best performer today, up ${bestPerformer.change24h?.toFixed(1)}%.`,
      priority: 6,
    })
  }

  // 3. Diversification check
  const topHolding = holdings.reduce((max, h) =>
    (h.valueUsd || 0) > (max.valueUsd || 0) ? h : max
  )
  const topHoldingPercent = ((topHolding.valueUsd || 0) / totalValue) * 100

  if (topHoldingPercent > 60) {
    insights.push({
      id: 'concentration',
      type: 'diversification',
      icon: '⚠️',
      title: 'High Concentration',
      body: `${topHoldingPercent.toFixed(0)}% of your portfolio is in ${topHolding.symbol}. Consider diversifying to reduce risk.`,
      priority: 9,
    })
  } else if (holdings.length >= 5) {
    insights.push({
      id: 'diversified',
      type: 'diversification',
      icon: '✅',
      title: 'Well Diversified',
      body: `Nice spread across ${holdings.length} tokens. Your largest position is ${topHoldingPercent.toFixed(0)}% in ${topHolding.symbol}.`,
      priority: 4,
    })
  }

  // 4. SKR staking insights
  const skrHolding = holdings.find(h => h.mint === SKR_CONFIG.mint)

  if (stakingInfo && stakingInfo.stakedAmount > 0) {
    // Has staking - check rewards
    const pendingRewardsUi = stakingInfo.pendingRewards / Math.pow(10, SKR_CONFIG.decimals)
    const rewardsUsd = skrPrice ? pendingRewardsUi * skrPrice : 0

    if (rewardsUsd >= 1) {
      insights.push({
        id: 'claim-rewards',
        type: 'staking',
        icon: '💰',
        title: 'Rewards Ready',
        body: `You have ${pendingRewardsUi.toLocaleString()} SKR ($${rewardsUsd.toFixed(2)}) in unclaimed staking rewards.`,
        priority: 10,
      })
    }

    // Calculate projected yearly rewards
    const stakedUi = stakingInfo.stakedAmount / Math.pow(10, SKR_CONFIG.decimals)
    const yearlyRewards = stakedUi * SKR_CONFIG.currentApy
    const yearlyUsd = skrPrice ? yearlyRewards * skrPrice : 0

    if (yearlyUsd > 100) {
      insights.push({
        id: 'staking-earning',
        type: 'staking',
        icon: '🌱',
        title: 'Passive Income',
        body: `Your staked SKR is earning ~${yearlyRewards.toLocaleString()} SKR/year ($${yearlyUsd.toFixed(0)}) at ${(SKR_CONFIG.currentApy * 100).toFixed(1)}% APY.`,
        priority: 5,
      })
    }
  } else if (skrHolding && skrHolding.uiAmount > 1000) {
    // Has SKR but not staking - opportunity
    const potentialRewards = skrHolding.uiAmount * SKR_CONFIG.currentApy
    const potentialUsd = skrPrice ? potentialRewards * skrPrice : 0

    insights.push({
      id: 'stake-opportunity',
      type: 'opportunity',
      icon: '💡',
      title: 'Stake Your SKR',
      body: `You have ${skrHolding.uiAmount.toLocaleString()} unstaked SKR. Staking could earn you ~${potentialRewards.toLocaleString()} SKR/year ($${potentialUsd.toFixed(0)}).`,
      priority: 9,
    })
  }

  // 5. Large SOL holding opportunity
  if (solHolding && (solHolding.valueUsd || 0) > 10000 && !stakingInfo?.stakedAmount) {
    insights.push({
      id: 'sol-opportunity',
      type: 'opportunity',
      icon: '🔮',
      title: 'Consider SKR',
      body: `With ${solHolding.uiAmount.toFixed(0)} SOL, you might benefit from the Solana Mobile ecosystem. SKR offers ${(SKR_CONFIG.currentApy * 100).toFixed(0)}% APY staking.`,
      priority: 3,
    })
  }

  // Sort by priority (highest first) and return top 3
  return insights.sort((a, b) => b.priority - a.priority).slice(0, 3)
}

export function AIInsights() {
  const { holdings, totalValueUsd } = usePortfolioStore()
  const { balance, priceUsd, staking } = useSkrStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const insights = useMemo(() => {
    const stakingData = staking ? {
      stakedAmount: staking.stakedAmount,
      pendingRewards: staking.pendingRewards,
    } : null
    return generateInsights(holdings, totalValueUsd, stakingData, priceUsd)
  }, [holdings, totalValueUsd, staking, priceUsd])

  if (insights.length === 0) return null

  const handlePress = (id: string) => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <Animated.View entering={FadeIn.duration(400).delay(200)} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>✨</Text>
        <Text style={styles.headerTitle}>AI Insights</Text>
      </View>

      <View style={styles.insightsList}>
        {insights.map((insight, index) => (
          <Animated.View
            key={insight.id}
            entering={FadeInDown.duration(300).delay(100 + index * 80)}
          >
            <Pressable
              style={({ pressed }) => [
                styles.insightCard,
                pressed && styles.insightCardPressed,
                expandedId === insight.id && styles.insightCardExpanded,
              ]}
              onPress={() => handlePress(insight.id)}
            >
              <View style={styles.insightHeader}>
                <Text style={styles.insightIcon}>{insight.icon}</Text>
                <Text style={styles.insightTitle}>{insight.title}</Text>
              </View>
              <Text
                style={styles.insightBody}
                numberOfLines={expandedId === insight.id ? undefined : 2}
              >
                {insight.body}
              </Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  insightsList: {
    gap: spacing.sm,
  },
  insightCard: {
    backgroundColor: colors.glassBg,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  insightCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  insightCardExpanded: {
    borderColor: colors.accentPurple,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  insightIcon: {
    fontSize: 18,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  insightBody: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
})
