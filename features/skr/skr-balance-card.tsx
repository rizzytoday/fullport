import { View, Text, StyleSheet, Pressable, Linking } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useSkrStore } from '@/stores/skr-store'
import { SKR_CONFIG } from '@/constants/app-config'
import { colors, spacing, borderRadius } from '@/constants/app-styles'
import Animated, { FadeIn } from 'react-native-reanimated'

function formatAmount(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M`
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(2)}K`
  }
  return amount.toFixed(2)
}

function formatUsd(value: number | null): string {
  if (value === null) return '--'
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`
  }
  return `$${value.toFixed(2)}`
}

export function SkrBalanceCard() {
  const { uiBalance, priceUsd, valueUsd, staking, isLoading } = useSkrStore()

  const totalSkr = uiBalance + (staking?.stakedUiAmount ?? 0)
  const totalValue = valueUsd
    ? valueUsd + (staking?.stakedUiAmount ?? 0) * (priceUsd ?? 0)
    : null

  const handleLearnMore = () => {
    Linking.openURL('https://solanamobile.com/skr')
  }

  // Show zero state with CTA
  if (totalSkr === 0 && !isLoading) {
    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            source={{ uri: SKR_CONFIG.logoUri }}
            style={styles.logo}
            contentFit="cover"
          />
          <View style={styles.headerText}>
            <Text style={styles.symbol}>SKR</Text>
            <Text style={styles.price}>@ ${priceUsd?.toFixed(4) ?? '--'}</Text>
          </View>
        </View>

        {/* Zero State */}
        <View style={styles.zeroState}>
          <Ionicons name="sparkles" size={32} color={colors.accentPurple} />
          <Text style={styles.zeroTitle}>No SKR Yet</Text>
          <Text style={styles.zeroDescription}>
            SKR is the Solana Mobile token. Stake it with Guardians to earn rewards.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.learnButton, pressed && styles.learnButtonPressed]}
            onPress={handleLearnMore}
          >
            <Text style={styles.learnButtonText}>Learn More</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.accentPurple} />
          </Pressable>
        </View>
      </Animated.View>
    )
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image
          source={{ uri: SKR_CONFIG.logoUri }}
          style={styles.logo}
          contentFit="cover"
        />
        <View style={styles.headerText}>
          <Text style={styles.symbol}>SKR</Text>
          <Text style={styles.price}>@ ${priceUsd?.toFixed(4) ?? '--'}</Text>
        </View>
      </View>

      {/* Main Balance */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceValue}>{formatAmount(totalSkr)}</Text>
        <Text style={styles.balanceUsd}>{formatUsd(totalValue)}</Text>
      </View>

      {/* Thin Separator */}
      <View style={styles.separator} />

      {/* Balance Breakdown */}
      <View style={styles.breakdown}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Available</Text>
          <Text style={styles.breakdownValue}>{formatAmount(uiBalance)}</Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Staked</Text>
          <Text style={styles.breakdownValue}>
            {formatAmount(staking?.stakedUiAmount ?? 0)}
          </Text>
        </View>
        {staking && staking.pendingRewards > 0 && (
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Rewards</Text>
            <Text style={[styles.breakdownValue, styles.rewardsValue]}>
              +{formatAmount(staking.pendingRewards / Math.pow(10, SKR_CONFIG.decimals))}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glassBg,
  },
  headerText: {
    gap: 2,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  price: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textMuted,
  },
  balanceSection: {
    gap: spacing.xs,
  },
  balanceValue: {
    fontSize: 44,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  balanceUsd: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.glassBorder,
  },
  breakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    gap: 2,
  },
  breakdownLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  rewardsValue: {
    color: colors.accentGreen,
  },
  // Zero state styles
  zeroState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  zeroTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  zeroDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
  learnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  learnButtonPressed: {
    opacity: 0.6,
  },
  learnButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accentPurple,
  },
})
