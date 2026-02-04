import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius, typography } from '@/constants/app-styles'
import Animated, { FadeIn } from 'react-native-reanimated'

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  variant?: 'default' | 'compact'
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
}: EmptyStateProps) {
  const isCompact = variant === 'compact'

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.container, isCompact && styles.containerCompact]}
    >
      <View style={[styles.iconCircle, isCompact && styles.iconCircleCompact]}>
        <Ionicons
          name={icon}
          size={isCompact ? 24 : 32}
          color={colors.textMuted}
        />
      </View>
      <Text style={[styles.title, isCompact && styles.titleCompact]}>{title}</Text>
      <Text style={[styles.description, isCompact && styles.descriptionCompact]}>
        {description}
      </Text>
      {actionLabel && onAction && (
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
          ]}
          onPress={onAction}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  containerCompact: {
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconCircleCompact: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 0,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 16,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  descriptionCompact: {
    fontSize: 14,
    maxWidth: 240,
  },
  actionButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.accentPurple,
    borderRadius: borderRadius.md,
  },
  actionButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  actionText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
})
