import { View, Text, StyleSheet, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSkrStore } from '@/stores/skr-store'
import { useStakingRewardsStore } from '@/stores/staking-rewards-store'
import { SKR_CONFIG, GUARDIANS } from '@/constants/app-config'
import { colors, spacing } from '@/constants/app-styles'
import { CooldownTimer } from '@/features/skr/cooldown-timer'
import Animated, { FadeIn } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

const isWeb = Platform.OS === 'web'

interface StakingCardProps {
  onStake?: () => void
  onUnstake?: () => void
  onChangeGuardian?: () => void
}

export function StakingCard({ onStake, onUnstake, onChangeGuardian }: StakingCardProps) {
  const { uiBalance, staking, currentApy, priceUsd } = useSkrStore()
  const { totalEarned, totalEarnedUsd } = useStakingRewardsStore()

  const handleStake = () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onStake?.()
  }

  const handleUnstake = () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onUnstake?.()
  }

  const canStake = uiBalance > 0
  const canUnstake = staking && staking.stakedUiAmount > 0

  // Calculate cooldown end in milliseconds for CooldownTimer
  const cooldownEndMs = staking?.cooldownEnd && staking.isUnstaking
    ? staking.cooldownEnd * 1000
    : null

  // Get the actual guardian's commission (not always first guardian)
  const selectedGuardian = staking?.guardianName
    ? GUARDIANS.find(g => g.name === staking.guardianName) ?? GUARDIANS[0]
    : GUARDIANS[0]

  return (
    <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.container}>
      {/* Thin Separator */}
      <View style={styles.separator} />

      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>Staking</Text>
        <Text style={styles.apyBadge}>{(currentApy * 100).toFixed(1)}% APY</Text>
      </View>

      {/* Guardian Info */}
      <Pressable
        style={({ pressed }) => [styles.guardianRow, pressed && styles.pressed]}
        onPress={() => {
          if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          onChangeGuardian?.()
        }}
      >
        <View style={styles.guardianInfo}>
          <Text style={styles.guardianLabel}>Guardian</Text>
          <Text style={styles.guardianName}>
            {selectedGuardian.name}
          </Text>
        </View>
        <Text style={styles.guardianCommission}>
          {selectedGuardian.commission}% fee
        </Text>
      </Pressable>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Staked</Text>
          <Text style={styles.statValue}>
            {staking?.stakedUiAmount ? `${(staking.stakedUiAmount / 1000).toFixed(0)}K` : '0'}
          </Text>
          <Text style={styles.statUnit}>SKR</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={[styles.statValue, styles.rewardsText]}>
            +{((staking?.pendingRewards ?? 0) / Math.pow(10, SKR_CONFIG.decimals)).toFixed(0)}
          </Text>
          <Text style={[styles.statUnit, styles.rewardsText]}>SKR</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Earned</Text>
          <Text style={[styles.statValue, styles.earnedText]}>
            ${totalEarnedUsd >= 1000 ? `${(totalEarnedUsd / 1000).toFixed(1)}K` : totalEarnedUsd.toFixed(0)}
          </Text>
          <Text style={[styles.statUnit, styles.earnedText]}>
            {totalEarned >= 1000 ? `${(totalEarned / 1000).toFixed(1)}K` : totalEarned.toFixed(0)} SKR
          </Text>
        </View>
      </View>

      {/* Cooldown Timer */}
      {staking?.isUnstaking && (
        <CooldownTimer cooldownEnd={cooldownEndMs} />
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <LinearGradient
          colors={[colors.solanaGradientStart, colors.solanaGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientWrapper, !canStake && styles.buttonDisabled]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.stakeButtonGradient,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleStake}
            disabled={!canStake}
          >
            <Text style={styles.stakeButtonText}>Stake</Text>
          </Pressable>
        </LinearGradient>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.unstakeButton,
            !canUnstake && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleUnstake}
          disabled={!canUnstake}
        >
          <Text style={styles.unstakeButtonText}>Unstake</Text>
        </Pressable>
      </View>

      {/* Info Text */}
      <Text style={styles.infoText}>
        Rewards compound every 48h. Unstaking has a 48h cooldown.
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: colors.glassBorder,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  apyBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accentGreen,
  },
  guardianRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.glassBg,
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  guardianInfo: {
    gap: 2,
  },
  guardianLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  guardianName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  guardianCommission: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.glassBorder,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  statUnit: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: -2,
  },
  rewardsText: {
    color: colors.accentGreen,
  },
  earnedText: {
    color: colors.accentPurple,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  gradientWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  stakeButtonGradient: {
    backgroundColor: 'transparent',
  },
  stakeButton: {
    backgroundColor: colors.textPrimary,
  },
  unstakeButton: {
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  stakeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.bgPrimary,
  },
  unstakeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  infoText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
    textAlign: 'center',
  },
})
