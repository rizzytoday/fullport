import { View, Text, StyleSheet } from 'react-native'
import { appStyles, colors, spacing, borderRadius, typography, shadows } from '@/constants/app-styles'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'

// TODO: Replace with real SKR data from blockchain
const MOCK_SKR_DATA = {
  balance: 15420.5,
  priceUsd: 0.42,
  change24h: 8.5,
  staked: 10000,
  rewards: 245.8,
}

export function SkrBalance() {
  const { balance, priceUsd, change24h, staked, rewards } = MOCK_SKR_DATA
  const totalValue = balance * priceUsd
  const isPositive = change24h >= 0

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <LinearGradient
        colors={['rgba(168, 85, 247, 0.2)', 'rgba(168, 85, 247, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="diamond" size={24} color={colors.accentPurple} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>SKR Balance</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>${priceUsd.toFixed(4)}</Text>
              <Text
                style={[
                  styles.change,
                  { color: isPositive ? colors.accentGreen : colors.accentRed },
                ]}
              >
                {isPositive ? '+' : ''}{change24h.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Balance */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.balanceContainer}
        >
          <Text style={styles.balance}>{balance.toLocaleString()}</Text>
          <Text style={styles.symbol}>SKR</Text>
        </Animated.View>
        <Text style={styles.value}>${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Staked</Text>
            <Text style={styles.statValue}>{staked.toLocaleString()}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Available</Text>
            <Text style={styles.statValue}>{(balance - staked).toLocaleString()}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Rewards</Text>
            <Text style={[styles.statValue, { color: colors.accentGreen }]}>
              +{rewards.toFixed(1)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...shadows.md,
  },
  gradient: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.accentPurple + '40',
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentPurple + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  price: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  change: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  balance: {
    ...typography.displayMedium,
    color: colors.textPrimary,
  },
  symbol: {
    ...typography.h3,
    color: colors.accentPurple,
  },
  value: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    ...typography.labelSmall,
    color: colors.textMuted,
  },
  statValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.glassBorder,
  },
})
