import { useEffect, useState, useRef } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import { colors } from '@/constants/app-styles'

interface SlotCounterProps {
  value: number
  duration?: number
  style?: any
  onComplete?: () => void
}

export function SlotCounter({ value, duration = 1200, style, onComplete }: SlotCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const opacity = useSharedValue(1)
  const translateY = useSharedValue(0)
  const animationRan = useRef(false)

  // Format as currency
  const formatValue = (val: number): string => {
    if (val >= 1_000_000) {
      return `$${(val / 1_000_000).toFixed(2)}M`
    }
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  useEffect(() => {
    // No animation requested - just update value (don't set flag)
    if (duration === 0) {
      setDisplayValue(value)
      opacity.value = 1
      translateY.value = 0
      return
    }

    // Animation already ran - just update value
    if (animationRan.current) {
      setDisplayValue(value)
      return
    }

    // NOW set the flag and run animation
    animationRan.current = true

    // Start hidden
    opacity.value = 0
    translateY.value = 20

    // Fade in animation
    opacity.value = withDelay(100, withTiming(1, { duration: 300 }))
    translateY.value = withDelay(100, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }))

    // Count up animation from 85%
    const startValue = value * 0.85
    const diff = value - startValue
    const steps = 40
    const stepDuration = duration / steps
    let currentStep = 0

    setDisplayValue(startValue)

    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easedProgress = 1 - Math.pow(1 - progress, 4)
      const newValue = startValue + diff * easedProgress

      setDisplayValue(newValue)

      if (currentStep >= steps) {
        clearInterval(interval)
        setDisplayValue(value)
        onComplete?.()
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }, [value, duration, onComplete])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Animated.Text style={[styles.text, style, animatedStyle]}>
      {formatValue(displayValue)}
    </Animated.Text>
  )
}

const styles = StyleSheet.create({
  text: {
    color: colors.textPrimary,
  },
})
