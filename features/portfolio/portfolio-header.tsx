import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { usePortfolioStore } from '@/stores/portfolio-store'
import { colors, spacing, typography, borderRadius } from '@/constants/app-styles'
import { formatRelativeTime, isDataStale } from '@/hooks/use-network-status'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function PortfolioHeader() {
  const { totalValueUsd, change24h, walletCount, lastUpdated } = usePortfolioStore()

  const isPositive = (change24h ?? 0) >= 0
  const changeText = change24h !== null
    ? `${isPositive ? '+' : ''}${change24h.toFixed(2)}%`
    : '--'

  const isStale = isDataStale(lastUpdated, 5) // Stale after 5 minutes
  const lastUpdatedText = formatRelativeTime(lastUpdated)

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Portfolio</Text>
        {walletCount > 1 && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.walletBadge}>
            <Ionicons name="wallet-outline" size={12} color={colors.textMuted} />
            <Text style={styles.walletBadgeText}>{walletCount} wallets</Text>
          </Animated.View>
        )}
        {lastUpdated && (
          <View style={[styles.updatedBadge, isStale && styles.staleBadge]}>
            <Ionicons
              name={isStale ? 'time-outline' : 'checkmark-circle'}
              size={10}
              color={isStale ? colors.accentGold : colors.accentGreen}
            />
            <Text style={[styles.updatedText, isStale && styles.staleText]}>
              {lastUpdatedText}
            </Text>
          </View>
        )}
      </View>

      <Animated.Text
        entering={FadeInDown.delay(50).duration(400)}
        style={styles.value}
      >
        {formatCurrency(totalValueUsd)}
      </Animated.Text>

      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={styles.changeRow}
      >
        <Text
          style={[
            styles.change,
            { color: isPositive ? colors.accentGreen : colors.accentRed },
          ]}
        >
          {changeText}
        </Text>
        <Text style={styles.period}>24h</Text>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.labelSmall,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.glassBg,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
  },
  walletBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
  },
  updatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 'auto',
  },
  staleBadge: {
    opacity: 0.8,
  },
  updatedText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.accentGreen,
  },
  staleText: {
    color: colors.accentGold,
  },
  value: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  change: {
    ...typography.body,
    fontWeight: '600',
  },
  period: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
})
