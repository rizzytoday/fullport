import { useState, useCallback } from 'react'
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown, FadeInRight } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

import { colors, spacing, borderRadius, typography } from '@/constants/app-styles'
import { useSkrStore } from '@/stores/skr-store'
import { GUARDIANS } from '@/constants/app-config'

const isWeb = Platform.OS === 'web'

// Extended guardian list for demo
const ALL_GUARDIANS = [
  {
    address: 'SKRGdBwzb1AtFW2chhBnZpGFnFLj6Mi7HM7iwjXALvw',
    name: 'Solana Mobile',
    description: 'Official Solana Mobile guardian',
    commission: 0,
    totalStaked: '45.2M',
    active: true,
  },
  {
    address: 'HeL1Us1234567890123456789012345678901234567',
    name: 'Helius',
    description: 'High-performance RPC provider',
    commission: 5,
    totalStaked: '32.1M',
    active: true,
  },
  {
    address: 'JiTo1234567890123456789012345678901234567890',
    name: 'Jito',
    description: 'MEV infrastructure experts',
    commission: 5,
    totalStaked: '28.7M',
    active: true,
  },
  {
    address: 'AnZa1234567890123456789012345678901234567890',
    name: 'Anza',
    description: 'Solana validator client team',
    commission: 5,
    totalStaked: '21.3M',
    active: true,
  },
  {
    address: 'Tri10n12345678901234567890123456789012345678',
    name: 'Triton',
    description: 'Enterprise-grade infrastructure',
    commission: 8,
    totalStaked: '15.6M',
    active: true,
  },
]

interface GuardianSelectModalProps {
  visible: boolean
  onClose: () => void
  onSelect?: (guardian: typeof ALL_GUARDIANS[0]) => void
}

export function GuardianSelectModal({ visible, onClose, onSelect }: GuardianSelectModalProps) {
  const { staking } = useSkrStore()
  const [selectedAddress, setSelectedAddress] = useState(
    staking?.guardian ?? GUARDIANS[0].address
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleSelect = useCallback((guardian: typeof ALL_GUARDIANS[0]) => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedAddress(guardian.address)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsLoading(true)

    const selected = ALL_GUARDIANS.find(g => g.address === selectedAddress)
    if (selected) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      onSelect?.(selected)
    }

    setIsLoading(false)
    onClose()
  }, [selectedAddress, onSelect, onClose])

  const handleClose = useCallback(() => {
    if (isLoading) return
    onClose()
  }, [isLoading, onClose])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </Pressable>

        <Animated.View
          entering={SlideInDown.duration(300).damping(25).stiffness(200)}
          exiting={SlideOutDown.duration(200)}
          style={styles.container}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={24} color={colors.accentPurple} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Select Guardian</Text>
              <Text style={styles.subtitle}>Choose who to delegate your SKR to</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>

          {/* Guardian List */}
          <View style={styles.list}>
            {ALL_GUARDIANS.map((guardian, index) => {
              const isSelected = guardian.address === selectedAddress
              return (
                <Animated.View
                  key={guardian.address}
                  entering={FadeInRight.delay(index * 50).duration(300)}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.guardianRow,
                      isSelected && styles.guardianRowSelected,
                      pressed && styles.guardianRowPressed,
                    ]}
                    onPress={() => handleSelect(guardian)}
                  >
                    <View style={styles.guardianInfo}>
                      <View style={[
                        styles.guardianIcon,
                        isSelected && styles.guardianIconSelected
                      ]}>
                        <Ionicons
                          name="server"
                          size={18}
                          color={isSelected ? colors.accentPurple : colors.textMuted}
                        />
                      </View>
                      <View style={styles.guardianDetails}>
                        <Text style={styles.guardianName}>{guardian.name}</Text>
                        <Text style={styles.guardianDescription}>
                          {guardian.description}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.guardianStats}>
                      <Text style={styles.guardianStaked}>{guardian.totalStaked}</Text>
                      <Text style={[
                        styles.guardianCommission,
                        guardian.commission === 0 && styles.commissionFree
                      ]}>
                        {guardian.commission === 0 ? 'No fee' : `${guardian.commission}% fee`}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark-circle" size={24} color={colors.accentPurple} />
                      </View>
                    )}
                  </Pressable>
                </Animated.View>
              )
            })}
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={16} color={colors.textMuted} />
            <Text style={styles.infoText}>
              Guardian commission is deducted from your staking rewards. Higher stake guardians
              provide more network security.
            </Text>
          </View>

          {/* Confirm Button */}
          <Pressable
            style={({ pressed }) => [
              styles.confirmButton,
              isLoading && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.bgPrimary} />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Guardian</Text>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl + 20,
    gap: spacing.lg,
    maxHeight: '85%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.glassBorder,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentPurple + '25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: spacing.sm,
  },
  guardianRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassBg,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  guardianRowSelected: {
    borderColor: colors.accentPurple + '60',
    backgroundColor: colors.accentPurple + '15',
  },
  guardianRowPressed: {
    opacity: 0.8,
  },
  guardianInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  guardianIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardianIconSelected: {
    backgroundColor: colors.accentPurple + '30',
  },
  guardianDetails: {
    flex: 1,
  },
  guardianName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  guardianDescription: {
    ...typography.labelSmall,
    color: colors.textMuted,
  },
  guardianStats: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  guardianStaked: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  guardianCommission: {
    ...typography.labelSmall,
    color: colors.textMuted,
  },
  commissionFree: {
    color: colors.accentGreen,
  },
  checkmark: {
    marginLeft: spacing.xs,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  infoText: {
    flex: 1,
    ...typography.labelSmall,
    color: colors.textMuted,
  },
  confirmButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPurple,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
  },
  confirmButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})
