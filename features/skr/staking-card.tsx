import { View, Text, StyleSheet, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSkrStore } from '@/stores/skr-store'
import { SKR_CONFIG, GUARDIANS } from '@/constants/app-config'
import { colors, spacing } from '@/constants/app-styles'
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
  const { uiBalance, staking, currentApy } = useSkrStore()

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

  // Calculate cooldown status
  const cooldownRemaining = staking?.cooldownEnd
    ? Math.max(0, staking.cooldownEnd - Date.now() / 1000)
    : 0
  const cooldownHours = Math.ceil(cooldownRemaining / 3600)

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
            {staking?.guardianName ?? GUARDIANS[0].name}
          </Text>
        </View>
        <Text style={styles.guardianCommission}>
          {GUARDIANS[0].commission}% fee
        </Text>
      </Pressable>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Staked</Text>
          <Text style={styles.statValue}>
            {staking?.stakedUiAmount?.toFixed(0) ?? '0'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Rewards</Text>
          <Text style={[styles.statValue, styles.rewardsText]}>
            +{((staking?.pendingRewards ?? 0) / Math.pow(10, SKR_CONFIG.decimals)).toFixed(2)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Interval</Text>
          <Text style={styles.statValue}>48h</Text>
        </View>
      </View>

      {/* Cooldown Warning */}
      {staking?.isUnstaking && cooldownRemaining > 0 && (
        <View style={styles.cooldownBanner}>
          <Text style={styles.cooldownText}>
            Unstaking in progress - {cooldownHours}h remaining
          </Text>
        </View>
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
  rewardsText: {
    color: colors.accentGreen,
  },
  cooldownBanner: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 8,
  },
  cooldownText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#f59e0b',
    textAlign: 'center',
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
