import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle, G } from 'react-native-svg'
import { usePortfolioStore } from '@/stores/portfolio-store'
import { colors, spacing, typography } from '@/constants/app-styles'
import Animated, { FadeIn } from 'react-native-reanimated'

// Muted color palette
const CHART_COLORS = [
  '#a855f7', // purple
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
]

interface ChartSegment {
  symbol: string
  percentage: number
  color: string
}

export function AllocationChart() {
  const { holdings, totalValueUsd } = usePortfolioStore()

  if (holdings.length === 0 || totalValueUsd === 0) {
    return null
  }

  // Create segments (top 5 + Other)
  const segments: ChartSegment[] = []
  let otherPercentage = 0

  holdings.forEach((holding, index) => {
    const percentage = holding.valueUsd
      ? (holding.valueUsd / totalValueUsd) * 100
      : 0

    if (index < 5 && percentage > 0) {
      segments.push({
        symbol: holding.symbol,
        percentage,
        color: CHART_COLORS[index % CHART_COLORS.length],
      })
    } else if (percentage > 0) {
      otherPercentage += percentage
    }
  })

  if (otherPercentage > 0) {
    segments.push({
      symbol: 'Other',
      percentage: otherPercentage,
      color: colors.textMuted,
    })
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
      <View style={styles.content}>
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
              {segmentArcs.map((segment) => (
                <Circle
                  key={segment.symbol}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={segment.dashArray}
                  strokeLinecap="butt"
                  fill="none"
                  rotation={segment.rotation}
                  origin={`${center}, ${center}`}
                />
              ))}
            </G>
          </Svg>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {segments.map((segment) => (
            <View key={segment.symbol} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: segment.color }]} />
              <Text style={styles.legendSymbol}>{segment.symbol}</Text>
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
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  chartContainer: {
    width: 120,
    height: 120,
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
  legendPercent: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
})
