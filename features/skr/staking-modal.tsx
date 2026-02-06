import { useState, useCallback } from 'react'
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

import { colors, spacing, borderRadius, typography } from '@/constants/app-styles'
import { useSkrStore } from '@/stores/skr-store'
import { SKR_CONFIG, GUARDIANS } from '@/constants/app-config'
import { DEMO_MODE } from '@/constants/mock-data'
import { getAddMemoInstruction } from '@solana-program/memo'
import {
  buildStakeInstruction,
  buildUnstakeInstruction,
  validateStakeAmount,
  formatSkrAmount,
  calculateProjectedRewards,
} from './skr-staking-service'

// Use devnet test mode (sends memo instead of actual staking tx)
const DEVNET_TEST_MODE = true

const isWeb = Platform.OS === 'web'

type ModalMode = 'stake' | 'unstake'

interface StakingModalProps {
  visible: boolean
  mode: ModalMode
  onClose: () => void
  onSuccess?: () => void
}

export function StakingModal({ visible, mode, onClose, onSuccess }: StakingModalProps) {
  const wallet = isWeb ? null : useMobileWallet()
  const { uiBalance, staking, currentApy, priceUsd } = useSkrStore()

  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txSignature, setTxSignature] = useState<string | null>(null)

  const maxAmount = mode === 'stake'
    ? uiBalance
    : (staking?.stakedUiAmount ?? 0)

  const parsedAmount = parseFloat(amount) || 0
  const validation = validateStakeAmount(parsedAmount, maxAmount)
  const projectedRewards = mode === 'stake'
    ? calculateProjectedRewards(parsedAmount, currentApy, 30)
    : 0
  const usdValue = priceUsd ? parsedAmount * priceUsd : null

  const handleMaxPress = useCallback(() => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setAmount(maxAmount.toString())
    setError(null)
  }, [maxAmount])

  const handleQuickAmount = useCallback((percent: number) => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const quickAmount = maxAmount * percent
    setAmount(quickAmount.toFixed(2))
    setError(null)
  }, [maxAmount])

  const handleSubmit = useCallback(async () => {
    if (!wallet?.account?.address) {
      setError('Wallet not connected')
      return
    }

    if (!validation.valid) {
      setError(validation.error ?? 'Invalid amount')
      return
    }

    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsLoading(true)
    setError(null)

    try {
      const baseUnits = Math.floor(parsedAmount * Math.pow(10, SKR_CONFIG.decimals))

      // In demo mode, simulate the transaction without actually sending
      if (DEMO_MODE) {
        console.log(`[DEMO] Simulating ${mode} transaction for ${parsedAmount} SKR...`)

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Generate a fake signature
        const fakeSignature = `DEMO${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
        console.log(`[DEMO] Simulated signature: ${fakeSignature}`)
        setTxSignature(fakeSignature)

        if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        setTimeout(() => {
          setAmount('')
          setTxSignature(null)
          onSuccess?.()
          onClose()
        }, 2000)
        return
      }

      // Real transaction flow
      if (!wallet.sendTransaction) {
        setError('Wallet does not support transactions')
        return
      }

      let signature: string

      // On devnet, send a memo transaction as a test (SKR program only exists on mainnet)
      if (DEVNET_TEST_MODE) {
        console.log(`[DEVNET TEST] Sending memo transaction for ${mode} ${parsedAmount} SKR`)
        const memoInstruction = getAddMemoInstruction({
          memo: `Fullport ${mode}: ${parsedAmount} SKR to ${staking?.guardianName ?? 'Solana Mobile'}`,
        })
        signature = await wallet.sendTransaction([memoInstruction])
      } else {
        // Real mainnet staking transaction
        const instruction = mode === 'stake'
          ? buildStakeInstruction({
              userAddress: wallet.account.address,
              amount: baseUnits,
              guardianAddress: staking?.guardian ?? SKR_CONFIG.primaryGuardian,
            })
          : buildUnstakeInstruction({
              userAddress: wallet.account.address,
              amount: baseUnits,
            })

        console.log(`Submitting ${mode} transaction for ${parsedAmount} SKR...`)
        signature = await wallet.sendTransaction([instruction])
      }

      console.log(`Transaction submitted: ${signature}`)
      setTxSignature(signature)

      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      // Reset and close after short delay
      setTimeout(() => {
        setAmount('')
        setTxSignature(null)
        onSuccess?.()
        onClose()
      }, 2000)
    } catch (err) {
      console.error(`${mode} transaction failed:`, err)
      setError(err instanceof Error ? err.message : 'Transaction failed')
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } finally {
      setIsLoading(false)
    }
  }, [wallet, validation, parsedAmount, mode, staking, onSuccess, onClose])

  const handleClose = useCallback(() => {
    if (isLoading) return
    setAmount('')
    setError(null)
    setTxSignature(null)
    onClose()
  }, [isLoading, onClose])

  const isStake = mode === 'stake'
  const title = isStake ? 'Stake SKR' : 'Unstake SKR'
  const subtitle = isStake
    ? 'Delegate to a Guardian and earn rewards'
    : '48-hour cooldown before withdrawal'
  const buttonText = isStake ? 'Stake SKR' : 'Unstake SKR'
  const buttonColor = isStake ? colors.accentGreen : colors.accentRed

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </Pressable>

        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.container}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: buttonColor + '25' }]}>
              <Ionicons
                name={isStake ? 'add-circle' : 'remove-circle'}
                size={24}
                color={buttonColor}
              />
            </View>
            <View style={styles.headerText}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{title}</Text>
                {DEMO_MODE && (
                  <View style={styles.demoBadge}>
                    <Text style={styles.demoBadgeText}>DEMO</Text>
                  </View>
                )}
              </View>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>

          {/* Success State */}
          {txSignature ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={48} color={colors.accentGreen} />
              <Text style={styles.successTitle}>
                {DEMO_MODE ? 'Demo Complete!' : 'Transaction Sent!'}
              </Text>
              <Text style={styles.successSignature}>
                {txSignature.slice(0, 8)}...{txSignature.slice(-8)}
              </Text>
            </View>
          ) : (
            <>
              <ScrollView
                style={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
              {/* Amount Input */}
              <View style={styles.inputSection}>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={(text) => {
                      setAmount(text.replace(/[^0-9.]/g, ''))
                      setError(null)
                    }}
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    editable={!isLoading}
                  />
                  <Text style={styles.inputSymbol}>SKR</Text>
                  <Pressable
                    style={styles.maxButton}
                    onPress={handleMaxPress}
                    disabled={isLoading}
                  >
                    <Text style={styles.maxButtonText}>MAX</Text>
                  </Pressable>
                </View>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>
                    {isStake ? 'Available:' : 'Staked:'} {formatSkrAmount(maxAmount)} SKR
                  </Text>
                  {usdValue !== null && parsedAmount > 0 && (
                    <Text style={styles.usdValue}>≈ ${formatSkrAmount(usdValue)}</Text>
                  )}
                </View>
              </View>

              {/* Quick Amount Buttons */}
              <View style={styles.quickAmounts}>
                {[0.25, 0.5, 0.75, 1].map((percent) => (
                  <Pressable
                    key={percent}
                    style={({ pressed }) => [
                      styles.quickButton,
                      pressed && styles.quickButtonPressed,
                    ]}
                    onPress={() => handleQuickAmount(percent)}
                    disabled={isLoading}
                  >
                    <Text style={styles.quickButtonText}>
                      {percent === 1 ? '100%' : `${percent * 100}%`}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Guardian + APY Row */}
              {isStake && (
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Guardian</Text>
                    <Text style={styles.infoValue}>{staking?.guardianName ?? GUARDIANS[0].name}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>APY</Text>
                    <Text style={[styles.infoValue, { color: colors.accentGreen }]}>
                      {(currentApy * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              )}

              {/* Unstake Warning */}
              {!isStake && (
                <View style={styles.warningBox}>
                  <Ionicons name="time" size={16} color="#f59e0b" />
                  <Text style={styles.warningText}>48-hour cooldown after unstaking</Text>
                </View>
              )}

              {/* Error */}
              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={colors.accentRed} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </ScrollView>

              {/* Submit Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  { backgroundColor: buttonColor },
                  (!validation.valid || isLoading) && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleSubmit}
                disabled={!validation.valid || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.bgPrimary} />
                ) : (
                  <>
                    <Ionicons
                      name={isStake ? 'add-circle' : 'remove-circle'}
                      size={20}
                      color={colors.bgPrimary}
                    />
                    <Text style={styles.submitButtonText}>{buttonText}</Text>
                  </>
                )}
              </Pressable>
            </>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
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
    padding: spacing.md,
    paddingBottom: spacing.lg + 20, // Extra padding for home indicator
    gap: spacing.sm,
    maxHeight: '80%',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  demoBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  demoBadgeText: {
    ...typography.labelSmall,
    color: colors.bgPrimary,
    fontWeight: '700',
    fontSize: 10,
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
  scrollContent: {
    flexGrow: 0,
  },
  inputSection: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassBg,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.displayMedium,
    color: colors.textPrimary,
    padding: 0,
  },
  inputSymbol: {
    ...typography.body,
    color: colors.textMuted,
    marginRight: spacing.sm,
  },
  maxButton: {
    backgroundColor: colors.accentPurple + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  maxButtonText: {
    ...typography.labelSmall,
    color: colors.accentPurple,
    fontWeight: '700',
  },
  usdValue: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    ...typography.labelSmall,
    color: colors.textMuted,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickButton: {
    flex: 1,
    backgroundColor: colors.glassBg,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  quickButtonPressed: {
    opacity: 0.7,
  },
  quickButtonText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  infoItem: {
    flex: 1,
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  infoLabel: {
    ...typography.labelSmall,
    color: colors.textMuted,
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#f59e0b' + '20',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  warningText: {
    ...typography.labelSmall,
    color: '#f59e0b',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentRed + '20',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  errorText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.accentRed,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  submitButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.bgPrimary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  successTitle: {
    ...typography.h2,
    color: colors.accentGreen,
  },
  successSignature: {
    ...typography.mono,
    color: colors.textMuted,
    fontSize: 14,
  },
  demoNote: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
})
