import { View, Text, StyleSheet, useWindowDimensions } from 'react-native'
import { useSkrStore } from '@/stores/skr-store'
import { colors, spacing } from '@/constants/app-styles'
import Animated, { FadeIn } from 'react-native-reanimated'
import { ProjectedEarningsChart } from './projected-earnings-chart'

export function ProjectedRewards() {
  const { uiBalance, staking, priceUsd, currentApy } = useSkrStore()
  const { width: screenWidth } = useWindowDimensions()
  const chartWidth = Math.min(screenWidth - 64, 340)

  // Calculate projected earnings if all SKR is staked
  const totalStakeable = (staking?.stakedUiAmount ?? 0) + uiBalance
  const yearlyRewards = totalStakeable * currentApy
  const monthlyRewards = yearlyRewards / 12  // APY / 12 for consistent monthly calc
  const dailyRewards = yearlyRewards / 365

  const formatReward = (amount: number) => {
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`
    if (amount >= 1) return amount.toFixed(1)
    return amount.toFixed(2)
  }

  const formatUsd = (amount: number) => {
    if (!priceUsd) return '--'
    const usd = amount * priceUsd
    if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}K`
    if (usd >= 1) return `$${usd.toFixed(2)}`
    return `$${usd.toFixed(4)}`
  }

  // Don't show if nothing to stake
  if (totalStakeable <= 0) return null

  return (
    <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>If you stake all SKR</Text>
        <Text style={styles.apyBadge}>{(currentApy * 100).toFixed(1)}% APY</Text>
      </View>

      {/* Projected Earnings Chart with milestones */}
      <ProjectedEarningsChart
        totalStaked={totalStakeable}
        currentApy={currentApy}
        priceUsd={priceUsd}
        width={chartWidth}
        height={140}
      />

      {/* Projections Row */}
      <View style={styles.projections}>
        <View style={styles.projectionItem}>
          <Text style={styles.projectionLabel}>Daily</Text>
          <Text style={styles.projectionValue}>+{formatReward(dailyRewards)}</Text>
          <Text style={styles.projectionUsd}>{formatUsd(dailyRewards)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.projectionItem}>
          <Text style={styles.projectionLabel}>Monthly</Text>
          <Text style={styles.projectionValue}>+{formatReward(monthlyRewards)}</Text>
          <Text style={styles.projectionUsd}>{formatUsd(monthlyRewards)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.projectionItem}>
          <Text style={styles.projectionLabel}>Yearly</Text>
          <Text style={[styles.projectionValue, styles.yearlyValue]}>
            +{formatReward(yearlyRewards)}
          </Text>
          <Text style={[styles.projectionUsd, styles.yearlyUsd]}>
            {formatUsd(yearlyRewards)}
          </Text>
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glassBg,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  apyBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accentGreen,
  },
  projections: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  projectionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  projectionLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  projectionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  yearlyValue: {
    color: colors.accentGreen,
  },
  projectionUsd: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.textMuted,
  },
  yearlyUsd: {
    color: colors.accentGreen,
  },
  divider: {
    width: 1,
    backgroundColor: colors.glassBorder,
    marginVertical: 4,
  },
})
