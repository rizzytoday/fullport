import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useStakingRewardsStore, RewardClaim } from '@/stores/staking-rewards-store'
import { useSkrStore } from '@/stores/skr-store'
import { SlotCounter } from '@/components/slot-counter'
import { colors, spacing, borderRadius } from '@/constants/app-styles'

// Format currency values
function formatUsd(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`
  }
  return `$${value.toFixed(2)}`
}

function formatSkr(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M`
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(2)}K`
  }
  return amount.toFixed(2)
}

// Calculate days since last claim
function getDaysSinceLastClaim(claims: RewardClaim[]): number | null {
  if (claims.length === 0) return null
  const timestamps = claims.map((c) => c.timestamp)
  const lastClaim = Math.max(...timestamps)
  const daysSince = Math.floor((Date.now() - lastClaim) / (24 * 60 * 60 * 1000))
  return daysSince
}

// Mini sparkline component
interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
}

function Sparkline({ data, width = 100, height = 32, color = colors.accentPurple }: SparklineProps) {
  if (data.length < 2) return null

  const paddingY = 4
  const chartHeight = height - paddingY * 2
  const maxVal = Math.max(...data)
  const minVal = Math.min(...data)
  const range = maxVal - minVal || 1

  // Generate points
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = paddingY + chartHeight - ((value - minVal) / range) * chartHeight
    return { x, y }
  })

  // Create smooth curve path
  const pathData = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`
      const prev = points[index - 1]
      const cpX = (prev.x + point.x) / 2
      return `Q ${cpX} ${prev.y} ${point.x} ${point.y}`
    })
    .join(' ')

  // Fill path
  const fillPath = `${pathData} L ${points[points.length - 1].x} ${height} L 0 ${height} Z`

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.3" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={fillPath} fill="url(#sparklineGradient)" />
      <Path
        d={pathData}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function StakingIncomeCard() {
  const {
    claims,
    totalEarned,
    totalEarnedUsd,
    thisMonthEarnedUsd,
    dailyAverage,
  } = useStakingRewardsStore()

  const { priceUsd } = useSkrStore()

  const daysSinceLastClaim = getDaysSinceLastClaim(claims)
  const dailyAverageUsd = priceUsd ? dailyAverage * priceUsd : 0

  // Generate sparkline data from last 30 days of claims
  const getSparklineData = (): number[] => {
    if (claims.length === 0) return []

    // Group claims by day for last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const recentClaims = claims.filter((c) => c.timestamp >= thirtyDaysAgo)

    if (recentClaims.length === 0) return []

    // Create daily buckets
    const dailyTotals: { [key: string]: number } = {}
    recentClaims.forEach((claim) => {
      const date = new Date(claim.timestamp).toISOString().split('T')[0]
      dailyTotals[date] = (dailyTotals[date] || 0) + claim.usdValue
    })

    // Fill in gaps and create array
    const dates = Object.keys(dailyTotals).sort()
    if (dates.length < 2) return []

    return dates.map((date) => dailyTotals[date])
  }

  const sparklineData = getSparklineData()
  const hasClaims = claims.length > 0

  // Empty state
  if (!hasClaims) {
    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="trending-up" size={18} color={colors.accentPurple} />
            </View>
            <Text style={styles.title}>Staking Income</Text>
          </View>
        </View>

        {/* Empty State */}
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No Rewards Yet</Text>
          <Text style={styles.emptyDescription}>
            Stake your SKR with a Guardian to start earning rewards. Your earnings history will appear here.
          </Text>
        </View>
      </Animated.View>
    )
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="trending-up" size={18} color={colors.accentPurple} />
          </View>
          <Text style={styles.title}>Staking Income</Text>
        </View>
        {sparklineData.length > 1 && (
          <View style={styles.sparklineContainer}>
            <Sparkline data={sparklineData} width={80} height={28} />
          </View>
        )}
      </View>

      {/* Main Stat */}
      <View style={styles.mainStat}>
        <Text style={styles.mainValue}>{formatSkr(totalEarned)}</Text>
        <Text style={styles.skrLabel}>SKR</Text>
      </View>

      {/* USD Value */}
      <SlotCounter
        value={totalEarnedUsd}
        duration={1000}
        style={styles.usdValue}
      />

      {/* Thin Separator */}
      <View style={styles.separator} />

      {/* Sub-stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>This Month</Text>
          <Text style={styles.statValue}>{formatUsd(thisMonthEarnedUsd)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Daily Avg</Text>
          <Text style={styles.statValue}>{formatUsd(dailyAverageUsd)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Last Claim</Text>
          <Text style={styles.statValue}>
            {daysSinceLastClaim === 0 ? 'Today' : `${daysSinceLastClaim}d ago`}
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
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  sparklineContainer: {
    opacity: 0.9,
  },
  mainStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  mainValue: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  skrLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accentPurple,
    letterSpacing: -0.3,
  },
  usdValue: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: -spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: colors.glassBorder,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.glassBorder,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  // Empty state styles
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptyDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
})
