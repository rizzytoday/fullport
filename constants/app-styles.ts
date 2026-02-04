import { StyleSheet } from 'react-native'
import { colors, spacing, borderRadius, typography, shadows } from './theme'

export const appStyles = StyleSheet.create({
  // Screens
  screen: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  screenPadded: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    paddingHorizontal: spacing.lg,
  },

  // Layout
  stack: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Glass Card
  card: {
    backgroundColor: colors.glassBg,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  cardSmall: {
    backgroundColor: colors.glassBg,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },

  // Typography
  displayLarge: {
    ...typography.displayLarge,
    color: colors.textPrimary,
  },
  displayMedium: {
    ...typography.displayMedium,
    color: colors.textPrimary,
  },
  h1: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  h2: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  h3: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textPrimary,
  },
  bodySecondary: {
    ...typography.body,
    color: colors.textSecondary,
  },
  bodySmall: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  mono: {
    ...typography.mono,
    color: colors.textPrimary,
  },

  // Title (legacy compatibility)
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },

  // Colors
  textGreen: {
    color: colors.accentGreen,
  },
  textRed: {
    color: colors.accentRed,
  },
  textPurple: {
    color: colors.accentPurple,
  },

  // Buttons
  button: {
    backgroundColor: colors.glassBg,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.textPrimary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimaryText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.bgPrimary,
  },
  buttonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  // Pill badges
  pill: {
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  pillText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  },

  // List items
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassBg,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.glassBorder,
    marginVertical: spacing.md,
  },
})

export { colors, spacing, borderRadius, typography, shadows, animation } from './theme'
