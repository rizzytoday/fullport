import { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  interpolate,
} from 'react-native-reanimated'
import { colors, spacing, animation } from '@/constants/theme'

// Constants
const COOLDOWN_DURATION_MS = 48 * 60 * 60 * 1000 // 48 hours in milliseconds
const ONE_HOUR_MS = 60 * 60 * 1000
const CIRCLE_SIZE = 120
const STROKE_WIDTH = 8
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Create animated circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface CooldownTimerProps {
  /** Timestamp (in milliseconds) when the cooldown ends, or null if no cooldown active */
  cooldownEnd: number | null
}

type CooldownStatus = 'inactive' | 'active' | 'complete' | 'almostComplete'

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalMs: number
}

function calculateTimeRemaining(cooldownEnd: number): TimeRemaining {
  const now = Date.now()
  const totalMs = Math.max(0, cooldownEnd - now)

  const totalSeconds = Math.floor(totalMs / 1000)
  const days = Math.floor(totalSeconds / (24 * 60 * 60))
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, totalMs }
}

function formatTimeRemaining(time: TimeRemaining): string {
  const { days, hours, minutes, seconds } = time

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds.toString().padStart(2, '0')}s`
  }
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}

function getStatus(cooldownEnd: number | null, timeRemaining: TimeRemaining): CooldownStatus {
  if (cooldownEnd === null) return 'inactive'
  if (timeRemaining.totalMs <= 0) return 'complete'
  if (timeRemaining.totalMs <= ONE_HOUR_MS) return 'almostComplete'
  return 'active'
}

export function CooldownTimer({ cooldownEnd }: CooldownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    cooldownEnd ? calculateTimeRemaining(cooldownEnd) : { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 }
  )

  // Animation values
  const progress = useSharedValue(0)
  const pulseScale = useSharedValue(1)
  const glowOpacity = useSharedValue(0.5)

  const status = getStatus(cooldownEnd, timeRemaining)

  // Update time remaining every second
  useEffect(() => {
    if (!cooldownEnd || status === 'inactive') return

    const updateTime = () => {
      setTimeRemaining(calculateTimeRemaining(cooldownEnd))
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [cooldownEnd, status])

  // Update progress animation
  useEffect(() => {
    if (!cooldownEnd || status === 'inactive') {
      progress.value = 0
      return
    }

    const elapsed = Date.now() - (cooldownEnd - COOLDOWN_DURATION_MS)
    const progressValue = Math.min(1, Math.max(0, elapsed / COOLDOWN_DURATION_MS))

    progress.value = withTiming(progressValue, {
      duration: animation.smoothEase.duration,
      easing: Easing.out(Easing.cubic),
    })
  }, [cooldownEnd, status, timeRemaining.totalMs])

  // Pulse animation for almost complete state
  useEffect(() => {
    if (status === 'almostComplete') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    } else {
      pulseScale.value = withTiming(1, { duration: 300 })
    }
  }, [status])

  // Glow animation for complete state
  useEffect(() => {
    if (status === 'complete') {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    } else {
      glowOpacity.value = withTiming(0.5, { duration: 300 })
    }
  }, [status])

  // Animated props for progress circle
  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress.value)
    return {
      strokeDashoffset,
    }
  })

  // Animated container style for pulse effect
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }))

  // Animated glow style
  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

  // Don't render anything if no cooldown is active
  if (status === 'inactive') {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
        <View style={styles.readyState}>
          <Text style={styles.readyText}>Ready to unstake</Text>
        </View>
      </Animated.View>
    )
  }

  const isComplete = status === 'complete'
  const isAlmostComplete = status === 'almostComplete'

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <Animated.View style={[styles.timerContainer, containerAnimatedStyle]}>
        {/* Glow effect for complete state */}
        {isComplete && (
          <Animated.View style={[styles.glowEffect, glowAnimatedStyle]} />
        )}

        {/* SVG Progress Ring */}
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={styles.svg}>
          <Defs>
            <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.accentPurple} />
              <Stop offset="100%" stopColor={colors.accentGold} />
            </LinearGradient>
            <LinearGradient id="completeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.accentGold} />
              <Stop offset="100%" stopColor={colors.accentGreen} />
            </LinearGradient>
          </Defs>

          {/* Background track */}
          <Circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            stroke={colors.glassBorder}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />

          {/* Progress arc */}
          <AnimatedCircle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            stroke={isComplete ? 'url(#completeGradient)' : 'url(#progressGradient)'}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedCircleProps}
            rotation={-90}
            origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
          />
        </Svg>

        {/* Center content */}
        <View style={styles.centerContent}>
          {isComplete ? (
            <>
              <Text style={styles.completeIcon}>✓</Text>
              <Text style={styles.completeLabel}>Ready</Text>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.timeText,
                  isAlmostComplete && styles.timeTextUrgent,
                ]}
              >
                {formatTimeRemaining(timeRemaining)}
              </Text>
              <Text style={styles.timerLabel}>remaining</Text>
            </>
          )}
        </View>
      </Animated.View>

      {/* Status text below timer */}
      <Text style={[styles.statusText, isComplete && styles.statusTextComplete]}>
        {isComplete
          ? 'Ready to withdraw'
          : isAlmostComplete
          ? 'Almost there!'
          : 'Cooldown in progress'}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
  },
  timerContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  glowEffect: {
    position: 'absolute',
    width: CIRCLE_SIZE + 24,
    height: CIRCLE_SIZE + 24,
    borderRadius: (CIRCLE_SIZE + 24) / 2,
    backgroundColor: colors.accentGold,
    opacity: 0.15,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  timeTextUrgent: {
    color: colors.accentGold,
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  completeIcon: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accentGreen,
  },
  completeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accentGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  statusTextComplete: {
    color: colors.accentGreen,
  },
  readyState: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.glassBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  readyText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
})
