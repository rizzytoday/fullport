import { View, Text, StyleSheet, Pressable } from 'react-native'
import { appStyles, colors, spacing, borderRadius, typography, shadows } from '@/constants/app-styles'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

// TODO: Replace with real Guardian data
const MOCK_GUARDIANS = [
  { name: 'Helius', stake: '2.5M', apy: '8.2%', selected: true },
  { name: 'Jito', stake: '3.1M', apy: '7.8%', selected: false },
  { name: 'Marinade', stake: '1.8M', apy: '7.5%', selected: false },
]

interface Guardian {
  name: string
  stake: string
  apy: string
  selected: boolean
}

function GuardianRow({ guardian, index }: { guardian: Guardian; index: number }) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    // TODO: Handle guardian selection
  }

  return (
    <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
      <Pressable
        style={({ pressed }) => [
          styles.guardianRow,
          guardian.selected && styles.guardianRowSelected,
          pressed && { opacity: 0.8 },
        ]}
        onPress={handlePress}
      >
        <View style={styles.guardianInfo}>
          <View style={styles.guardianIcon}>
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={guardian.selected ? colors.accentPurple : colors.textMuted}
            />
          </View>
          <View>
            <Text style={styles.guardianName}>{guardian.name}</Text>
            <Text style={styles.guardianStake}>Total Stake: {guardian.stake}</Text>
          </View>
        </View>
        <View style={styles.guardianApy}>
          <Text style={styles.apyLabel}>APY</Text>
          <Text style={[styles.apyValue, guardian.selected && { color: colors.accentGreen }]}>
            {guardian.apy}
          </Text>
        </View>
        {guardian.selected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={colors.accentPurple} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  )
}

export function SkrStakingCard() {
  const handleStake = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    // TODO: Open staking modal
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
        {MOCK_GUARDIANS.map((guardian, index) => (
          <GuardianRow key={guardian.name} guardian={guardian} index={index} />
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
