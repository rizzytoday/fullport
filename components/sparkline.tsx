import { View, StyleSheet } from 'react-native'
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg'
import { colors } from '@/constants/app-styles'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  strokeWidth?: number
  showGradient?: boolean
}

export function Sparkline({
  data,
  width = 60,
  height = 24,
  color,
  strokeWidth = 1.5,
  showGradient = true,
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <View style={{ width, height }} />
  }

  // Determine color based on trend (first vs last value)
  const isPositive = data[data.length - 1] >= data[0]
  const lineColor = color ?? (isPositive ? colors.accentGreen : colors.accentRed)

  // Normalize data to fit in the view
  const minVal = Math.min(...data)
  const maxVal = Math.max(...data)
  const range = maxVal - minVal || 1 // Avoid division by zero

  // Add padding so line doesn't touch edges
  const paddingY = 2
  const chartHeight = height - paddingY * 2

  // Generate path points
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = paddingY + chartHeight - ((value - minVal) / range) * chartHeight
    return { x, y }
  })

  // Create SVG path
  const pathData = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`

      // Use quadratic curves for smoother lines
      const prev = points[index - 1]
      const cpX = (prev.x + point.x) / 2
      return `Q ${cpX} ${prev.y} ${point.x} ${point.y}`
    })
    .join(' ')

  // Create fill path (for gradient)
  const fillPath = `${pathData} L ${width} ${height} L 0 ${height} Z`

  const gradientId = `sparkline-gradient-${isPositive ? 'green' : 'red'}`

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {showGradient && (
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={lineColor} stopOpacity="0.3" />
              <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
            </LinearGradient>
          </Defs>
        )}

        {/* Gradient fill */}
        {showGradient && (
          <Path
            d={fillPath}
            fill={`url(#${gradientId})`}
          />
        )}

        {/* Line */}
        <Path
          d={pathData}
          stroke={lineColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
})
