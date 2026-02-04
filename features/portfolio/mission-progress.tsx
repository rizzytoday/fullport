import { View, Text, StyleSheet } from 'react-native'
import { usePortfolioStore } from '@/stores/portfolio-store'
import { colors, spacing, borderRadius, typography } from '@/constants/app-styles'
import Animated, { FadeIn } from 'react-native-reanimated'

// Default goal - user can customize this later
const DEFAULT_GOAL = 250000 // $250K goal

interface MissionProgressProps {
  goal?: number
}

export function MissionProgress({ goal = DEFAULT_GOAL }: MissionProgressProps) {
  const { totalValueUsd } = usePortfolioStore()

  const percentage = Math.min((totalValueUsd / goal) * 100, 100)
  const isComplete = percentage >= 100

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      {/* Single line: label ... percentage */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>Portfolio Goal</Text>
        <Text style={styles.target}>
          {formatCompact(totalValueUsd)} / {formatCompact(goal)}
        </Text>
      </View>

      {/* Ultra-thin progress bar */}
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            { width: `${percentage}%` },
            isComplete && styles.fillComplete,
          ]}
        />
      </View>
    </Animated.View>
  )
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...typography.labelSmall,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  target: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  },
  track: {
    height: 3,
    backgroundColor: colors.glassBorder,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accentPurple,
    borderRadius: 1.5,
  },
  fillComplete: {
    backgroundColor: colors.accentGreen,
  },
})
