import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import Svg, { Circle, G } from 'react-native-svg'
import { usePortfolioStore } from '@/stores/portfolio-store'
import { useSkrStore } from '@/stores/skr-store'
import { colors, spacing, typography, borderRadius } from '@/constants/app-styles'
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  SharedValue,
} from 'react-native-reanimated'
import { useState, useEffect } from 'react'
import * as Haptics from 'expo-haptics'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const isWeb = Platform.OS === 'web'

// Muted color palette
const CHART_COLORS = [
  '#a855f7', // purple
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
]

// Position view colors
const POSITION_COLORS = {
  staked: '#a855f7',    // purple - staked
  liquid: '#22c55e',    // green - liquid/available
  locked: '#f59e0b',    // amber - locked in cooldown
  stable: '#3b82f6',    // blue - stablecoins
}

// Known stablecoins
const STABLECOINS = ['USDC', 'USDT', 'PYUSD', 'DAI', 'USDH', 'UXD', 'FRAX']

type ViewMode = 'assets' | 'position'

interface ChartSegment {
  symbol: string
  percentage: number
  color: string
  value?: number
}

// Format currency for legend
function formatValue(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

// Animated segment component
interface AnimatedSegmentProps {
  cx: number
  cy: number
  r: number
  color: string
  strokeWidth: number
  dashArray: string
  rotation: number
  progress: SharedValue<number>
  delay: number
  circumference: number
}

function AnimatedSegment({
  cx,
  cy,
  r,
  color,
  strokeWidth,
  dashArray,
  rotation,
  progress,
  delay,
  circumference,
}: AnimatedSegmentProps) {
  const animatedProps = useAnimatedProps(() => {
    const [dashLength] = dashArray.split(' ').map(Number)
    const currentDash = dashLength * progress.value
    return {
      strokeDasharray: `${currentDash} ${circumference - currentDash}`,
    }
  })

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      r={r}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="butt"
      fill="none"
      rotation={rotation}
      origin={`${cx}, ${cy}`}
      animatedProps={animatedProps}
    />
  )
}

export function AllocationChart() {
  const [viewMode, setViewMode] = useState<ViewMode>('assets')
  const { holdings, totalValueUsd } = usePortfolioStore()
  const { staking, priceUsd, uiBalance } = useSkrStore()

  // Must be before any early returns to satisfy Rules of Hooks
  const animationProgress = useSharedValue(0)

  useEffect(() => {
    animationProgress.value = 0
    animationProgress.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    })
  }, [viewMode])

  const handleViewChange = (mode: ViewMode) => {
    if (mode !== viewMode) {
      if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      setViewMode(mode)
    }
  }

  if (holdings.length === 0 || totalValueUsd === 0) {
    return null
  }

  // Calculate segments based on view mode
  const segments: ChartSegment[] = []

  if (viewMode === 'assets') {
    // Asset view - Individual tokens (existing logic)
    let otherPercentage = 0
    let otherValue = 0

    holdings.forEach((holding, index) => {
      const percentage = holding.valueUsd
        ? (holding.valueUsd / totalValueUsd) * 100
        : 0

      if (index < 5 && percentage > 0) {
        segments.push({
          symbol: holding.symbol,
          percentage,
          color: CHART_COLORS[index % CHART_COLORS.length],
          value: holding.valueUsd ?? 0,
        })
      } else if (percentage > 0) {
        otherPercentage += percentage
        otherValue += holding.valueUsd ?? 0
      }
    })

    if (otherPercentage > 0) {
      segments.push({
        symbol: 'Other',
        percentage: otherPercentage,
        color: colors.textMuted,
        value: otherValue,
      })
    }
  } else {
    // Position view - Staked | Liquid | Stable | Locked
    const skrPrice = priceUsd ?? 0

    // Calculate values for each position
    const stakedAmount = staking?.stakedUiAmount ?? 0
    const stakedValue = stakedAmount * skrPrice

    // Locked = amount in unstaking cooldown (if any)
    const lockedAmount = staking?.isUnstaking ? stakedAmount : 0
    const lockedValue = lockedAmount * skrPrice

    // Separate stablecoins from other liquid assets
    const stableValue = holdings
      .filter(h => STABLECOINS.includes(h.symbol.toUpperCase()))
      .reduce((sum, h) => sum + (h.valueUsd ?? 0), 0)

    // Liquid SKR (unstaked balance)
    const liquidSkrAmount = uiBalance
    const liquidSkrValue = liquidSkrAmount * skrPrice

    // Other liquid assets (non-SKR, non-stablecoin tokens)
    const otherLiquidValue = holdings
      .filter(h => h.symbol !== 'SKR' && !STABLECOINS.includes(h.symbol.toUpperCase()))
      .reduce((sum, h) => sum + (h.valueUsd ?? 0), 0)

    const totalLiquidValue = liquidSkrValue + otherLiquidValue
    const totalStakedValue = staking?.isUnstaking ? 0 : stakedValue // If unstaking, it's locked not staked
    const totalLockedValue = lockedValue
    const totalStableValue = stableValue

    const total = totalLiquidValue + totalStakedValue + totalLockedValue + totalStableValue
    if (total === 0) {
      // Fallback to liquid = 100%
      segments.push({
        symbol: 'Liquid',
        percentage: 100,
        color: POSITION_COLORS.liquid,
        value: totalValueUsd,
      })
    } else {
      if (totalStakedValue > 0) {
        segments.push({
          symbol: 'Staked',
          percentage: (totalStakedValue / total) * 100,
          color: POSITION_COLORS.staked,
          value: totalStakedValue,
        })
      }
      if (totalLiquidValue > 0) {
        segments.push({
          symbol: 'Liquid',
          percentage: (totalLiquidValue / total) * 100,
          color: POSITION_COLORS.liquid,
          value: totalLiquidValue,
        })
      }
      if (totalStableValue > 0) {
        segments.push({
          symbol: 'Stable',
          percentage: (totalStableValue / total) * 100,
          color: POSITION_COLORS.stable,
          value: totalStableValue,
        })
      }
      if (totalLockedValue > 0) {
        segments.push({
          symbol: 'Locked',
          percentage: (totalLockedValue / total) * 100,
          color: POSITION_COLORS.locked,
          value: totalLockedValue,
        })
      }
      // Sort position segments by percentage (largest first)
      segments.sort((a, b) => b.percentage - a.percentage)
    }
  }

  // Chart dimensions
  const size = 120
  const strokeWidth = 16
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  // Calculate arcs
  let currentOffset = 0
  const segmentArcs = segments.map((segment) => {
    const dashLength = (segment.percentage / 100) * circumference
    const dashArray = `${dashLength} ${circumference - dashLength}`
    const rotation = currentOffset * 360 / 100 - 90
    currentOffset += segment.percentage
    return { ...segment, dashArray, rotation }
  })

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      {/* View Mode Selector - Above chart */}
      <View style={styles.viewSelector}>
        <TouchableOpacity
          style={[styles.viewPill, viewMode === 'assets' && styles.viewPillActive]}
          onPress={() => handleViewChange('assets')}
          activeOpacity={0.7}
        >
          <Text style={[styles.viewPillText, viewMode === 'assets' && styles.viewPillTextActive]}>
            Assets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewPill, viewMode === 'position' && styles.viewPillActive]}
          onPress={() => handleViewChange('position')}
          activeOpacity={0.7}
        >
          <Text style={[styles.viewPillText, viewMode === 'position' && styles.viewPillTextActive]}>
            Position
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart + Legend Row */}
      <View style={styles.chartRow}>
        {/* Donut Chart */}
        <View style={styles.chartContainer}>
          <Svg width={size} height={size}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={colors.glassBorder}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <G>
              {segmentArcs.map((segment, index) => (
                <AnimatedSegment
                  key={`${viewMode}-${segment.symbol}`}
                  cx={center}
                  cy={center}
                  r={radius}
                  color={segment.color}
                  strokeWidth={strokeWidth}
                  dashArray={segment.dashArray}
                  rotation={segment.rotation}
                  progress={animationProgress}
                  delay={index * 50}
                  circumference={circumference}
                />
              ))}
            </G>
          </Svg>
        </View>

        {/* Legend - Centered vertically with chart */}
        <View style={styles.legend}>
          {segments.map((segment) => (
            <View key={segment.symbol} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: segment.color }]} />
              <Text style={styles.legendSymbol}>{segment.symbol}</Text>
              {viewMode === 'position' && segment.value !== undefined && (
                <Text style={styles.legendValue}>{formatValue(segment.value)}</Text>
              )}
              <Text style={styles.legendPercent}>
                {segment.percentage.toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  viewSelector: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    minHeight: 130, // Minimum height to prevent shifting
  },
  chartContainer: {
    width: 120,
    height: 120,
  },
  viewPill: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  viewPillActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: colors.accentPurple,
  },
  viewPillText: {
    ...typography.labelSmall,
    color: colors.textMuted,
    fontWeight: '500',
  },
  viewPillTextActive: {
    color: colors.accentPurple,
    fontWeight: '600',
  },
  legend: {
    flex: 1,
    gap: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendSymbol: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  legendValue: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 11,
  },
  legendPercent: {
    ...typography.bodySmall,
    color: colors.textMuted,
    minWidth: 32,
    textAlign: 'right',
  },
})
