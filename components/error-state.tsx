import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius, typography } from '@/constants/app-styles'
import Animated, { FadeIn } from 'react-native-reanimated'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  variant?: 'default' | 'inline'
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  variant = 'default',
}: ErrorStateProps) {
  if (variant === 'inline') {
    return (
      <Animated.View entering={FadeIn.duration(200)} style={styles.inlineContainer}>
        <Ionicons name="warning" size={16} color={colors.accentRed} />
        <Text style={styles.inlineMessage}>{message}</Text>
        {onRetry && (
          <Pressable onPress={onRetry} hitSlop={8}>
            <Text style={styles.retryLink}>Retry</Text>
          </Pressable>
        )}
      </Animated.View>
    )
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="cloud-offline" size={32} color={colors.accentRed} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryButtonPressed,
          ]}
          onPress={onRetry}
        >
          <Ionicons name="refresh" size={18} color={colors.textPrimary} />
          <Text style={styles.retryText}>Try Again</Text>
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
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  retryButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  retryText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  // Inline variant
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  inlineMessage: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: colors.accentRed,
  },
  retryLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accentRed,
    textDecorationLine: 'underline',
  },
})
