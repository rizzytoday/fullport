import { View, Text, StyleSheet } from 'react-native'
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg'
import { colors, spacing } from '@/constants/app-styles'
import Animated, { FadeIn } from 'react-native-reanimated'

interface ProjectedEarningsChartProps {
  totalStaked: number
  currentApy: number
  priceUsd: number | null
  width?: number
  height?: number
}

const MILESTONES = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '12M', months: 12 },
]

export function ProjectedEarningsChart({
  totalStaked,
  currentApy,
  priceUsd,
  width = 320,
  height = 140,
}: ProjectedEarningsChartProps) {
  // Calculate projected values for each milestone
  const projections = MILESTONES.map(({ months }) => {
    const yearFraction = months / 12
    const projectedSkr = totalStaked * (1 + currentApy * yearFraction)
    const projectedUsd = priceUsd ? projectedSkr * priceUsd : null
    return { months, skr: projectedSkr, usd: projectedUsd }
  })

  const startValue = totalStaked * (priceUsd ?? 0)
  const values = [startValue, ...projections.map((p) => p.usd ?? 0)]

  // Chart dimensions
  const paddingLeft = 8
  const paddingRight = 8
  const paddingTop = 16
  const paddingBottom = 28
  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  // Normalize values
  const maxVal = Math.max(...values)
  const minVal = Math.min(...values)
  const range = maxVal - minVal || 1

  // Generate points (5 points: start + 4 milestones)
  const points = values.map((value, index) => {
    const x = paddingLeft + (index / (values.length - 1)) * chartWidth
    const y = paddingTop + chartHeight - ((value - minVal) / range) * chartHeight
    return { x, y, value }
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
  const fillPath = `${pathData} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${paddingLeft} ${paddingTop + chartHeight} Z`

  // Format USD value
  const formatUsd = (value: number | null) => {
    if (value === null || value === 0) return '--'
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toFixed(0)}`
  }

  return (
    <Animated.View entering={FadeIn.delay(50).duration(400)} style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.accentPurple} stopOpacity="0.4" />
            <Stop offset="1" stopColor={colors.accentPurple} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {MILESTONES.map((milestone, index) => {
          const x = paddingLeft + ((index + 1) / (values.length - 1)) * chartWidth
          return (
            <Line
              key={milestone.label}
              x1={x}
              y1={paddingTop}
              x2={x}
              y2={paddingTop + chartHeight}
              stroke={colors.glassBorder}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          )
        })}

        {/* Area fill */}
        <Path d={fillPath} fill="url(#chartGradient)" />

        {/* Line */}
        <Path
          d={pathData}
          stroke={colors.accentPurple}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.slice(1).map((point, index) => (
          <Circle
            key={MILESTONES[index].label}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={colors.accentPurple}
            stroke={colors.bgPrimary}
            strokeWidth={2}
          />
        ))}
      </Svg>

      {/* X-axis labels */}
      <View style={[styles.labels, { width, paddingLeft, paddingRight }]}>
        <View style={styles.labelItem}>
          <Text style={styles.labelText}>Now</Text>
          <Text style={styles.valueText}>{formatUsd(startValue)}</Text>
        </View>
        {MILESTONES.map((milestone, index) => (
          <View key={milestone.label} style={styles.labelItem}>
            <Text style={styles.labelText}>{milestone.label}</Text>
            <Text style={styles.valueText}>{formatUsd(projections[index].usd)}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  labelItem: {
    alignItems: 'center',
    gap: 2,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accentPurple,
  },
})
