import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  LayoutChangeEvent,
  GestureResponderEvent,
} from 'react-native'
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Line,
  Circle,
  G,
} from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  interpolate,
} from 'react-native-reanimated'
import {
  usePortfolioHistoryStore,
  PortfolioSnapshot,
} from '@/stores/portfolio-history-store'
import { usePortfolioStore } from '@/stores/portfolio-store'
import {
  colors,
  spacing,
  typography,
  borderRadius,
  animation,
} from '@/constants/app-styles'

// Animated components
const AnimatedPath = Animated.createAnimatedComponent(Path)
const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedLine = Animated.createAnimatedComponent(Line)

// Types
type Period = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'

interface ChartPoint {
  x: number
  y: number
  value: number
  timestamp: number
}

// Constants
const PERIODS: Period[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL']
const CHART_HEIGHT = 180
const CHART_PADDING_TOP = 20
const CHART_PADDING_BOTTOM = 10
const GLOW_PADDING = 12

// Format currency
function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
  return `$${value.toFixed(2)}`
}

// Format date for tooltip
function formatDate(timestamp: number, period: Period): string {
  const date = new Date(timestamp)
  if (period === '1D') {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  if (period === '1W' || period === '1M') {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })
}

// Estimate path length for animation
function estimatePathLength(points: ChartPoint[]): number {
  let length = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x
    const dy = points[i].y - points[i - 1].y
    length += Math.sqrt(dx * dx + dy * dy)
  }
  return length * 1.2
}

// Generate smooth path from points
function generatePath(points: ChartPoint[]): string {
  if (points.length < 2) return ''
  return points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`
      const prev = points[index - 1]
      const cpX = (prev.x + point.x) / 2
      return `Q ${cpX} ${prev.y} ${point.x} ${point.y}`
    })
    .join(' ')
}

// Generate fill path for gradient
function generateFillPath(
  points: ChartPoint[],
  width: number,
  height: number
): string {
  if (points.length < 2) return ''
  const linePath = generatePath(points)
  return `${linePath} L ${width} ${height} L 0 ${height} Z`
}

// Period selector button
function PeriodButton({
  period,
  isSelected,
  onPress,
}: {
  period: Period
  isSelected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.periodButton,
        isSelected && styles.periodButtonSelected,
        pressed && styles.periodButtonPressed,
      ]}
    >
      <Text
        style={[
          styles.periodButtonText,
          isSelected && styles.periodButtonTextSelected,
        ]}
      >
        {period}
      </Text>
    </Pressable>
  )
}

// Empty state component
function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No History Yet</Text>
      <Text style={styles.emptySubtitle}>
        Portfolio history will appear here as data is collected
      </Text>
    </View>
  )
}

export function PortfolioHistoryChart() {
  // State
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1W')
  const [chartWidth, setChartWidth] = useState(0)
  const [touchedIndex, setTouchedIndex] = useState<number | null>(null)

  // Stores
  const getSnapshots = usePortfolioHistoryStore((s) => s.getSnapshots)
  const { totalValueUsd } = usePortfolioStore()

  // Animation values
  const lineProgress = useSharedValue(0)
  const fillOpacity = useSharedValue(0)
  const cursorOpacity = useSharedValue(0)

  // Get data for selected period
  const snapshots = useMemo(() => {
    const periodSnapshots = getSnapshots(selectedPeriod)

    // If we have no historical data, create a simple two-point chart
    // showing current value as a flat line
    if (periodSnapshots.length === 0 && totalValueUsd > 0) {
      const now = Date.now()
      return [
        { timestamp: now - 24 * 60 * 60 * 1000, totalValueUsd, holdings: [] },
        { timestamp: now, totalValueUsd, holdings: [] },
      ] as PortfolioSnapshot[]
    }

    // Add current value as last point if we have history
    if (periodSnapshots.length > 0 && totalValueUsd > 0) {
      const lastSnapshot = periodSnapshots[periodSnapshots.length - 1]
      // Only add if current value is different from last snapshot
      if (Math.abs(lastSnapshot.totalValueUsd - totalValueUsd) > 0.01) {
        return [
          ...periodSnapshots,
          { timestamp: Date.now(), totalValueUsd, holdings: [] },
        ] as PortfolioSnapshot[]
      }
    }

    return periodSnapshots
  }, [getSnapshots, selectedPeriod, totalValueUsd])

  // Calculate chart points
  const { points, pathData, fillPath, pathLength, minValue, maxValue } =
    useMemo(() => {
      if (snapshots.length < 2 || chartWidth === 0) {
        return {
          points: [],
          pathData: '',
          fillPath: '',
          pathLength: 0,
          minValue: 0,
          maxValue: 0,
        }
      }

      const values = snapshots.map((s) => s.totalValueUsd)
      const min = Math.min(...values)
      const max = Math.max(...values)
      const range = max - min || 1

      // Add padding to range
      const paddedMin = min - range * 0.05
      const paddedMax = max + range * 0.05
      const paddedRange = paddedMax - paddedMin

      const chartHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM

      const calculatedPoints: ChartPoint[] = snapshots.map((snapshot, index) => {
        const x = (index / (snapshots.length - 1)) * chartWidth
        const y =
          CHART_PADDING_TOP +
          chartHeight -
          ((snapshot.totalValueUsd - paddedMin) / paddedRange) * chartHeight
        return {
          x,
          y,
          value: snapshot.totalValueUsd,
          timestamp: snapshot.timestamp,
        }
      })

      return {
        points: calculatedPoints,
        pathData: generatePath(calculatedPoints),
        fillPath: generateFillPath(calculatedPoints, chartWidth, CHART_HEIGHT),
        pathLength: estimatePathLength(calculatedPoints),
        minValue: min,
        maxValue: max,
      }
    }, [snapshots, chartWidth])

  // Calculate period change
  const periodChange = useMemo(() => {
    if (snapshots.length < 2) return { amount: 0, percent: 0 }
    const startValue = snapshots[0].totalValueUsd
    const endValue = snapshots[snapshots.length - 1].totalValueUsd
    const amount = endValue - startValue
    const percent = startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0
    return { amount, percent }
  }, [snapshots])

  const isPositive = periodChange.percent >= 0
  const lineColor = colors.accentPurple

  // Handle layout change
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setChartWidth(event.nativeEvent.layout.width)
  }, [])

  // Animate on period change
  useEffect(() => {
    if (pathLength > 0) {
      lineProgress.value = 0
      fillOpacity.value = 0

      lineProgress.value = withSpring(1, {
        damping: 20,
        stiffness: 40,
        mass: 1,
      })

      fillOpacity.value = withDelay(
        300,
        withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
      )
    }
  }, [pathLength, selectedPeriod])

  // Touch handlers
  const handleTouchStart = useCallback(
    (event: GestureResponderEvent) => {
      if (points.length === 0) return
      const { locationX } = event.nativeEvent
      const index = Math.round(
        (locationX / chartWidth) * (points.length - 1)
      )
      const clampedIndex = Math.max(0, Math.min(points.length - 1, index))
      setTouchedIndex(clampedIndex)
      cursorOpacity.value = withTiming(1, { duration: 150 })
    },
    [points, chartWidth]
  )

  const handleTouchMove = useCallback(
    (event: GestureResponderEvent) => {
      if (points.length === 0) return
      const { locationX } = event.nativeEvent
      const index = Math.round(
        (locationX / chartWidth) * (points.length - 1)
      )
      const clampedIndex = Math.max(0, Math.min(points.length - 1, index))
      setTouchedIndex(clampedIndex)
    },
    [points, chartWidth]
  )

  const handleTouchEnd = useCallback(() => {
    setTouchedIndex(null)
    cursorOpacity.value = withTiming(0, { duration: 200 })
  }, [])

  // Animated props for line
  const animatedLineProps = useAnimatedProps(() => ({
    strokeDasharray: [pathLength, pathLength],
    strokeDashoffset: pathLength * (1 - lineProgress.value),
  }))

  // Animated props for glow
  const animatedGlowProps = useAnimatedProps(() => ({
    strokeDasharray: [pathLength, pathLength],
    strokeDashoffset: pathLength * (1 - lineProgress.value),
    strokeOpacity: 0.3 * lineProgress.value,
  }))

  // Animated props for fill
  const animatedFillProps = useAnimatedProps(() => ({
    fillOpacity: fillOpacity.value * 0.4,
  }))

  // Cursor position
  const touchedPoint = touchedIndex !== null ? points[touchedIndex] : null

  // Animated cursor style
  const cursorLineStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }))

  // Display values (show touched point or current)
  const displayValue =
    touchedPoint !== null ? touchedPoint.value : totalValueUsd
  const displayTimestamp = touchedPoint !== null ? touchedPoint.timestamp : null

  // Handle no data
  if (totalValueUsd === 0) {
    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
        <EmptyState />
      </Animated.View>
    )
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      {/* Header with value */}
      <View style={styles.header}>
        <Animated.View entering={FadeInDown.duration(300)}>
          <Text style={styles.valueLabel}>
            {touchedIndex !== null
              ? formatDate(displayTimestamp!, selectedPeriod)
              : 'Current Value'}
          </Text>
          <Text style={styles.value}>{formatCurrency(displayValue)}</Text>
        </Animated.View>

        {/* Period change */}
        {touchedIndex === null && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(300)}
            style={styles.changeContainer}
          >
            <Text
              style={[
                styles.changeAmount,
                { color: isPositive ? colors.accentGreen : colors.accentRed },
              ]}
            >
              {isPositive ? '+' : ''}
              {formatCurrency(periodChange.amount)}
            </Text>
            <Text
              style={[
                styles.changePercent,
                { color: isPositive ? colors.accentGreen : colors.accentRed },
              ]}
            >
              ({isPositive ? '+' : ''}
              {periodChange.percent.toFixed(2)}%)
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Chart */}
      <View
        style={styles.chartContainer}
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
        onResponderTerminate={handleTouchEnd}
      >
        {chartWidth > 0 && points.length >= 2 && (
          <Svg
            width={chartWidth + GLOW_PADDING * 2}
            height={CHART_HEIGHT + GLOW_PADDING * 2}
            style={{
              marginLeft: -GLOW_PADDING,
              marginTop: -GLOW_PADDING,
            }}
          >
            <Defs>
              <LinearGradient
                id="chartGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <Stop offset="0" stopColor={lineColor} stopOpacity="0.6" />
                <Stop offset="0.5" stopColor={lineColor} stopOpacity="0.2" />
                <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
              </LinearGradient>
            </Defs>

            <G translateX={GLOW_PADDING} translateY={GLOW_PADDING}>
              {/* Gradient fill */}
              <AnimatedPath
                d={fillPath}
                fill="url(#chartGradient)"
                animatedProps={animatedFillProps}
              />

              {/* Glow effect */}
              <AnimatedPath
                d={pathData}
                stroke={lineColor}
                strokeWidth={8}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                animatedProps={animatedGlowProps}
              />

              {/* Main line */}
              <AnimatedPath
                d={pathData}
                stroke={lineColor}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                animatedProps={animatedLineProps}
              />

              {/* Touch cursor */}
              {touchedPoint !== null && (
                <G>
                  {/* Vertical line */}
                  <Line
                    x1={touchedPoint.x}
                    y1={0}
                    x2={touchedPoint.x}
                    y2={CHART_HEIGHT}
                    stroke={colors.glassBorder}
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />

                  {/* Cursor dot - outer glow */}
                  <Circle
                    cx={touchedPoint.x}
                    cy={touchedPoint.y}
                    r={12}
                    fill={lineColor}
                    fillOpacity={0.2}
                  />

                  {/* Cursor dot - inner */}
                  <Circle
                    cx={touchedPoint.x}
                    cy={touchedPoint.y}
                    r={6}
                    fill={lineColor}
                  />

                  {/* Cursor dot - center */}
                  <Circle
                    cx={touchedPoint.x}
                    cy={touchedPoint.y}
                    r={3}
                    fill={colors.bgPrimary}
                  />
                </G>
              )}
            </G>
          </Svg>
        )}
      </View>

      {/* Period selector */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(300)}
        style={styles.periodSelector}
      >
        {PERIODS.map((period) => (
          <PeriodButton
            key={period}
            period={period}
            isSelected={selectedPeriod === period}
            onPress={() => setSelectedPeriod(period)}
          />
        ))}
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  valueLabel: {
    ...typography.labelSmall,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  changeAmount: {
    ...typography.body,
    fontWeight: '600',
  },
  changePercent: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  chartContainer: {
    height: CHART_HEIGHT,
    marginBottom: spacing.md,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  periodButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  periodButtonSelected: {
    backgroundColor: colors.accentPurple,
    borderColor: colors.accentPurple,
  },
  periodButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  periodButtonText: {
    ...typography.label,
    color: colors.textMuted,
    fontWeight: '600',
  },
  periodButtonTextSelected: {
    color: colors.textPrimary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
})
