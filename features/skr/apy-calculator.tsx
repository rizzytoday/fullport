import { View, Text, StyleSheet, useWindowDimensions } from 'react-native'
import { useSkrStore } from '@/stores/skr-store'
import { colors, spacing } from '@/constants/app-styles'
import Animated, { FadeIn } from 'react-native-reanimated'
import { ProjectedEarningsChart } from './projected-earnings-chart'

export function ApyCalculator() {
  const { uiBalance, staking, priceUsd, currentApy } = useSkrStore()
  const { width: screenWidth } = useWindowDimensions()
  const chartWidth = Math.min(screenWidth - 64, 340) // Account for padding

  // Calculate projected earnings
  const totalStaked = (staking?.stakedUiAmount ?? 0) + uiBalance
  const dailyRewards = (totalStaked * currentApy) / 365
  const monthlyRewards = dailyRewards * 30
  const yearlyRewards = totalStaked * currentApy

  const formatReward = (amount: number) => {
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`
    if (amount >= 1) return amount.toFixed(1)
    return amount.toFixed(4)
  }

  const formatUsd = (amount: number) => {
    if (!priceUsd) return '--'
    const usd = amount * priceUsd
    if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}K`
    if (usd >= 1) return `$${usd.toFixed(2)}`
    return `$${usd.toFixed(4)}`
  }

  return (
    <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.container}>
      {/* Thin Separator */}
      <View style={styles.separator} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>Projected Rewards</Text>
        <Text style={styles.subtitle}>if you stake all SKR</Text>
      </View>

      {/* Earnings Chart */}
      <ProjectedEarningsChart
        totalStaked={totalStaked}
        currentApy={currentApy}
        priceUsd={priceUsd}
        width={chartWidth}
        height={140}
      />

      {/* Projections Grid */}
      <View style={styles.projections}>
        <View style={styles.projectionItem}>
          <Text style={styles.projectionLabel}>Daily</Text>
          <Text style={styles.projectionValue}>+{formatReward(dailyRewards)}</Text>
          <Text style={styles.projectionUsd}>{formatUsd(dailyRewards)}</Text>
        </View>

        <View style={styles.projectionDivider} />

        <View style={styles.projectionItem}>
          <Text style={styles.projectionLabel}>Monthly</Text>
          <Text style={styles.projectionValue}>+{formatReward(monthlyRewards)}</Text>
          <Text style={styles.projectionUsd}>{formatUsd(monthlyRewards)}</Text>
        </View>

        <View style={styles.projectionDivider} />

        <View style={[styles.projectionItem, styles.yearlyItem]}>
          <Text style={styles.projectionLabel}>Yearly</Text>
          <Text style={[styles.projectionValue, styles.yearlyValue]}>
            +{formatReward(yearlyRewards)}
          </Text>
          <Text style={[styles.projectionUsd, styles.yearlyUsd]}>
            {formatUsd(yearlyRewards)}
          </Text>
        </View>
      </View>

      {/* Note */}
      <Text style={styles.noteText}>
        SKR inflation: 10% at launch, decreasing 25% yearly until 2%
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: colors.glassBorder,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  },
  projections: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: spacing.md,
  },
  projectionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  yearlyItem: {},
  projectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  projectionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  yearlyValue: {
    color: colors.accentGreen,
  },
  projectionUsd: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  },
  yearlyUsd: {
    color: colors.accentGreen,
  },
  projectionDivider: {
    width: 1,
    backgroundColor: colors.glassBorder,
  },
  noteText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
    textAlign: 'center',
  },
})
