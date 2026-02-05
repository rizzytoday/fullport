import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius } from '@/constants/app-styles'
import { useWatchedWalletsStore } from '@/stores/watched-wallets-store'
import { isValidSolanaAddress } from '@/features/portfolio/token-metadata-service'
import * as Haptics from 'expo-haptics'
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated'

const isWeb = Platform.OS === 'web'

interface AddWatchedWalletModalProps {
  visible: boolean
  onClose: () => void
}

export function AddWatchedWalletModal({ visible, onClose }: AddWatchedWalletModalProps) {
  const [address, setAddress] = useState('')
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { addWallet, wallets } = useWatchedWalletsStore()

  const resetState = () => {
    setAddress('')
    setLabel('')
    setError(null)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleAdd = () => {
    const trimmedAddress = address.trim()

    if (!isValidSolanaAddress(trimmedAddress)) {
      setError('Invalid Solana address format')
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }

    // Check if already watching
    if (wallets.some((w) => w.address === trimmedAddress)) {
      setError('This wallet is already being watched')
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      return
    }

    addWallet(trimmedAddress, label.trim() || undefined)
    if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    handleClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        {/* Backdrop */}
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={StyleSheet.absoluteFill}
        >
          <Pressable style={styles.backdrop} onPress={handleClose}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </Pressable>
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          entering={SlideInDown.duration(300).damping(25).stiffness(200)}
          exiting={SlideOutDown.duration(200)}
          style={styles.modalContent}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </Pressable>

          <View style={styles.content}>
            <Text style={styles.title}>Watch Wallet</Text>
            <Text style={styles.subtitle}>Track another wallet's holdings</Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Wallet Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Solana address..."
                  placeholderTextColor={colors.textMuted}
                  value={address}
                  onChangeText={(text) => {
                    setAddress(text)
                    setError(null)
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Label (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Trading wallet, Cold storage..."
                  placeholderTextColor={colors.textMuted}
                  value={label}
                  onChangeText={setLabel}
                  maxLength={24}
                />
              </View>
            </View>

            {error && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.errorContainer}>
                <Ionicons name="warning" size={16} color={colors.accentRed} />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleClose}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.primaryButton,
                  !address.trim() && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleAdd}
                disabled={!address.trim()}
              >
                <Text style={styles.primaryButtonText}>Add Wallet</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    minHeight: 340,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.glassBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
    marginTop: -spacing.sm,
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.accentRed,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.md,
  },
  primaryButton: {
    backgroundColor: colors.textPrimary,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.bgPrimary,
  },
  secondaryButton: {
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  secondaryButtonText: {
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
})
