import { useEffect, useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path, Defs, LinearGradient, Stop, G } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { colors } from '@/constants/app-styles'

// Create animated Path component
const AnimatedPath = Animated.createAnimatedComponent(Path)

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  strokeWidth?: number
  showGradient?: boolean
  animated?: boolean
  animationKey?: string | number // Change this to trigger re-animation
}

// Padding for glow effect
const GLOW_PADDING = 8

// Calculate approximate path length for dash animation
function estimatePathLength(points: { x: number; y: number }[]): number {
  let length = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x
    const dy = points[i].y - points[i - 1].y
    length += Math.sqrt(dx * dx + dy * dy)
  }
  // Add extra for curves
  return length * 1.2
}

export function Sparkline({
  data,
  width = 60,
  height = 24,
  color,
  strokeWidth = 1.5,
  showGradient = true,
  animated = false,
  animationKey,
}: SparklineProps) {
  const progress = useSharedValue(animated ? 0 : 1)
  const fillOpacity = useSharedValue(animated ? 0 : 1)

  // Calculate path data
  const { pathData, fillPath, lineColor, pathLength } = useMemo(() => {
    if (!data || data.length < 2) {
      return { pathData: '', fillPath: '', lineColor: colors.accentGreen, pathLength: 0 }
    }

    // Determine color based on trend (first vs last value)
    const isPositive = data[data.length - 1] >= data[0]
    const calculatedColor = color ?? (isPositive ? colors.accentGreen : colors.accentRed)

    // Normalize data to fit in the view
    const minVal = Math.min(...data)
    const maxVal = Math.max(...data)
    const range = maxVal - minVal || 1

    // Add padding so line doesn't touch edges
    const paddingY = 2
    const chartHeight = height - paddingY * 2

    // Generate path points
    const calculatedPoints = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = paddingY + chartHeight - ((value - minVal) / range) * chartHeight
      return { x, y }
    })

    // Create SVG path
    const calculatedPath = calculatedPoints
      .map((point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`
        const prev = calculatedPoints[index - 1]
        const cpX = (prev.x + point.x) / 2
        return `Q ${cpX} ${prev.y} ${point.x} ${point.y}`
      })
      .join(' ')

    // Create fill path (for gradient)
    const calculatedFillPath = `${calculatedPath} L ${width} ${height} L 0 ${height} Z`

    return {
      pathData: calculatedPath,
      fillPath: calculatedFillPath,
      lineColor: calculatedColor,
      pathLength: estimatePathLength(calculatedPoints),
    }
  }, [data, width, height, color])

  // Trigger animation on mount or when animationKey changes
  useEffect(() => {
    if (animated && pathLength > 0) {
      // Reset
      progress.value = 0
      fillOpacity.value = 0

      // Smooth spring animation for the line draw
      progress.value = withSpring(1, {
        damping: 20,
        stiffness: 40,
        mass: 1,
      })

      // Fade in gradient fill smoothly after line starts
      fillOpacity.value = withDelay(
        300,
        withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
      )
    }
  }, [animated, animationKey, pathLength])

  // Animated props for the main line
  const animatedLineProps = useAnimatedProps(() => ({
    strokeDasharray: [pathLength, pathLength],
    strokeDashoffset: pathLength * (1 - progress.value),
  }))

  // Animated props for glow layers
  const animatedGlowOuterProps = useAnimatedProps(() => ({
    strokeDasharray: [pathLength, pathLength],
    strokeDashoffset: pathLength * (1 - progress.value),
    strokeOpacity: 0.12 * progress.value,
  }))

  const animatedGlowMediumProps = useAnimatedProps(() => ({
    strokeDasharray: [pathLength, pathLength],
    strokeDashoffset: pathLength * (1 - progress.value),
    strokeOpacity: 0.2 * progress.value,
  }))

  // Animated props for fill
  const animatedFillProps = useAnimatedProps(() => ({
    fillOpacity: fillOpacity.value,
  }))

  if (!data || data.length < 2) {
    return <View style={{ width, height }} />
  }

  // Total size including glow padding
  const totalWidth = width + GLOW_PADDING * 2
  const totalHeight = height + GLOW_PADDING * 2

  const isPositive = data[data.length - 1] >= data[0]
  const gradientId = `sparkline-gradient-${isPositive ? 'green' : 'red'}-${animationKey || 'static'}`

  // Render animated version
  if (animated) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Svg
          width={totalWidth}
          height={totalHeight}
          style={{ marginLeft: -GLOW_PADDING, marginTop: -GLOW_PADDING }}
        >
          {showGradient && (
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={lineColor} stopOpacity="0.3" />
                <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
              </LinearGradient>
            </Defs>
          )}

          <G translateX={GLOW_PADDING} translateY={GLOW_PADDING}>
            {/* Animated gradient fill */}
            {showGradient && (
              <AnimatedPath
                d={fillPath}
                fill={`url(#${gradientId})`}
                animatedProps={animatedFillProps}
              />
            )}

            {/* Animated glow - outer */}
            <AnimatedPath
              d={pathData}
              stroke={lineColor}
              strokeWidth={strokeWidth + 8}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              animatedProps={animatedGlowOuterProps}
            />

            {/* Animated glow - medium */}
            <AnimatedPath
              d={pathData}
              stroke={lineColor}
              strokeWidth={strokeWidth + 4}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              animatedProps={animatedGlowMediumProps}
            />

            {/* Animated main line */}
            <AnimatedPath
              d={pathData}
              stroke={lineColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              animatedProps={animatedLineProps}
            />
          </G>
        </Svg>
      </View>
    )
  }

  // Render static version (for holdings list - no animation)
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg
        width={totalWidth}
        height={totalHeight}
        style={{ marginLeft: -GLOW_PADDING, marginTop: -GLOW_PADDING }}
      >
        {showGradient && (
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={lineColor} stopOpacity="0.3" />
              <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
            </LinearGradient>
          </Defs>
        )}

        <G translateX={GLOW_PADDING} translateY={GLOW_PADDING}>
          {/* Static gradient fill */}
          {showGradient && (
            <Path
              d={fillPath}
              fill={`url(#${gradientId})`}
            />
          )}

          {/* Static glow - outer */}
          <Path
            d={pathData}
            stroke={lineColor}
            strokeWidth={strokeWidth + 8}
            strokeOpacity={0.12}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Static glow - medium */}
          <Path
            d={pathData}
            stroke={lineColor}
            strokeWidth={strokeWidth + 4}
            strokeOpacity={0.2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Static main line */}
          <Path
            d={pathData}
            stroke={lineColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // Allow glow to overflow
  },
})
