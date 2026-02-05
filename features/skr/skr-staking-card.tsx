import { useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { appStyles, colors, spacing, borderRadius, typography, shadows } from '@/constants/app-styles'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { StakingModal } from './staking-modal'
import { GuardianSelectModal } from './guardian-select-modal'
import { useSkrStore } from '@/stores/skr-store'

// Guardian display data (matches GUARDIANS in app-config)
const DISPLAY_GUARDIANS = [
  { name: 'Solana Mobile', stake: '45.2M', apy: '21.1%', address: 'SKRGdBwzb1AtFW2chhBnZpGFnFLj6Mi7HM7iwjXALvw' },
  { name: 'Helius', stake: '32.1M', apy: '21.1%', address: 'HeL1Us1234567890123456789012345678901234567' },
  { name: 'Jito', stake: '28.7M', apy: '21.1%', address: 'JiTo1234567890123456789012345678901234567890' },
]

interface Guardian {
  name: string
  stake: string
  apy: string
  address: string
}

interface GuardianRowProps {
  guardian: Guardian
  index: number
  isSelected: boolean
  onPress: () => void
}

function GuardianRow({ guardian, index, isSelected, onPress }: GuardianRowProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  return (
    <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
      <Pressable
        style={({ pressed }) => [
          styles.guardianRow,
          isSelected && styles.guardianRowSelected,
          pressed && { opacity: 0.8 },
        ]}
        onPress={handlePress}
      >
        <View style={styles.guardianInfo}>
          <View style={styles.guardianIcon}>
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={isSelected ? colors.accentPurple : colors.textMuted}
            />
          </View>
          <View>
            <Text style={styles.guardianName}>{guardian.name}</Text>
            <Text style={styles.guardianStake}>Total Stake: {guardian.stake}</Text>
          </View>
        </View>
        <View style={styles.guardianApy}>
          <Text style={styles.apyLabel}>APY</Text>
          <Text style={[styles.apyValue, isSelected && { color: colors.accentGreen }]}>
            {guardian.apy}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={colors.accentPurple} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  )
}

export function SkrStakingCard() {
  const { staking } = useSkrStore()
  const [stakingModalVisible, setStakingModalVisible] = useState(false)
  const [guardianModalVisible, setGuardianModalVisible] = useState(false)

  // Get current guardian address (default to first one)
  const currentGuardianAddress = staking?.guardian ?? DISPLAY_GUARDIANS[0].address

  const handleStake = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setStakingModalVisible(true)
  }

  const handleGuardianPress = () => {
    setGuardianModalVisible(true)
  }

  return (
    <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.container}>
      <View style={styles.header}>
        <Text style={appStyles.h3}>Guardians</Text>
        <Text style={appStyles.bodySmall}>
          Delegate your SKR to earn staking rewards
        </Text>
      </View>

      <View style={styles.guardianList}>
        {DISPLAY_GUARDIANS.map((guardian, index) => (
          <GuardianRow
            key={guardian.name}
            guardian={guardian}
            index={index}
            isSelected={guardian.address === currentGuardianAddress}
            onPress={handleGuardianPress}
          />
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.stakeButton,
          pressed && styles.stakeButtonPressed,
        ]}
        onPress={handleStake}
      >
        <Ionicons name="add-circle" size={20} color={colors.bgPrimary} />
        <Text style={styles.stakeButtonText}>Stake More SKR</Text>
      </Pressable>

      {/* Staking Modal */}
      <StakingModal
        visible={stakingModalVisible}
        mode="stake"
        onClose={() => setStakingModalVisible(false)}
      />

      {/* Guardian Selection Modal */}
      <GuardianSelectModal
        visible={guardianModalVisible}
        onClose={() => setGuardianModalVisible(false)}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glassBg,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  guardianList: {
    gap: spacing.sm,
  },
  guardianRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  guardianRowSelected: {
    borderColor: colors.accentPurple + '50',
    backgroundColor: colors.accentPurple + '10',
  },
  guardianInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  guardianIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardianName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  guardianStake: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  guardianApy: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  apyLabel: {
    ...typography.labelSmall,
    color: colors.textMuted,
  },
  apyValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  selectedBadge: {
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
  },
  stakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textPrimary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  stakeButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  stakeButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.bgPrimary,
  },
})
