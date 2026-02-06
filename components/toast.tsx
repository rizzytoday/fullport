import { useEffect } from 'react'
import { Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius } from '@/constants/app-styles'

interface ToastProps {
  visible: boolean
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onHide: () => void
}

export function Toast({ visible, message, type = 'success', duration = 2500, onHide }: ToastProps) {
  const insets = useSafeAreaInsets()
  const translateY = useSharedValue(100)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      // Show animation
      translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) })
      opacity.value = withTiming(1, { duration: 200 })

      // Schedule hide with JS timeout (reliable)
      const hideTimer = setTimeout(() => {
        translateY.value = withTiming(100, { duration: 250 })
        opacity.value = withTiming(0, { duration: 200 })
      }, duration)

      // Call onHide after hide animation completes
      const completeTimer = setTimeout(onHide, duration + 300)

      return () => {
        clearTimeout(hideTimer)
        clearTimeout(completeTimer)
      }
    } else {
      // Reset position when hidden
      translateY.value = 100
      opacity.value = 0
    }
  }, [visible, duration, onHide])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }))

  if (!visible) return null

  const iconName = type === 'success' ? 'checkmark-circle' : type === 'error' ? 'alert-circle' : 'information-circle'
  const isSuccess = type === 'success'

  // Position above bottom tab bar (~80px) + safe area
  const bottomOffset = insets.bottom + 90

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: bottomOffset },
        isSuccess && styles.successContainer,
        animatedStyle,
      ]}
    >
      <Ionicons name={iconName} size={18} color={isSuccess ? '#fff' : type === 'error' ? colors.accentRed : colors.accentPurple} />
      <Text style={[styles.message, isSuccess && styles.successMessage]}>{message}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  successContainer: {
    backgroundColor: colors.accentGreen,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  successMessage: {
    color: '#fff',
  },
})
