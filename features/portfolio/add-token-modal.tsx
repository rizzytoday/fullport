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
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius } from '@/constants/app-styles'
import { useCustomTokensStore } from '@/stores/custom-tokens-store'
import { fetchTokenMetadata, TokenMetadata, isValidSolanaAddress } from './token-metadata-service'
import * as Haptics from 'expo-haptics'
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated'

const isWeb = Platform.OS === 'web'

interface AddTokenModalProps {
  visible: boolean
  onClose: () => void
}

type ModalStep = 'input' | 'preview' | 'details'

export function AddTokenModal({ visible, onClose }: AddTokenModalProps) {
  const [step, setStep] = useState<ModalStep>('input')
  const [mintAddress, setMintAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokenData, setTokenData] = useState<TokenMetadata | null>(null)
  const [manualAmount, setManualAmount] = useState('')
  const [manualPrice, setManualPrice] = useState('')

  const { addToken, getTokenByMint } = useCustomTokensStore()

  const resetState = () => {
    setStep('input')
    setMintAddress('')
    setIsLoading(false)
    setError(null)
    setTokenData(null)
    setManualAmount('')
    setManualPrice('')
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleLookup = async () => {
    const trimmedAddress = mintAddress.trim()

    if (!isValidSolanaAddress(trimmedAddress)) {
      setError('Invalid Solana address format')
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }

    // Check if token already added
    if (getTokenByMint(trimmedAddress)) {
      setError('This token is already in your list')
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await fetchTokenMetadata(trimmedAddress)

    setIsLoading(false)

    if (result.success) {
      setTokenData(result.data)
      setStep('preview')
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } else {
      setError(result.error.error)
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  const handleAddToken = () => {
    if (!tokenData) return

    const amount = manualAmount ? parseFloat(manualAmount) : null
    const price = manualPrice ? parseFloat(manualPrice) : tokenData.priceUsd

    addToken({
      mint: tokenData.mint,
      symbol: tokenData.symbol,
      name: tokenData.name,
      decimals: tokenData.decimals,
      logoUri: tokenData.logoUri,
      manualAmount: amount,
      manualPriceUsd: price,
    })

    if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    handleClose()
  }

  const renderInputStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.title}>Add Token</Text>
      <Text style={styles.subtitle}>Enter the token's mint address</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Mint address (e.g., So11...1112)"
          placeholderTextColor={colors.textMuted}
          value={mintAddress}
          onChangeText={(text) => {
            setMintAddress(text)
            setError(null)
          }}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
        />
        {mintAddress.length > 0 && (
          <Pressable
            style={styles.clearButton}
            onPress={() => setMintAddress('')}
          >
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {error && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.errorContainer}>
          <Ionicons name="warning" size={16} color={colors.accentRed} />
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.primaryButton,
          (!mintAddress.trim() || isLoading) && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleLookup}
        disabled={!mintAddress.trim() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.bgPrimary} />
        ) : (
          <Text style={styles.primaryButtonText}>Look Up</Text>
        )}
      </Pressable>
    </View>
  )

  const renderPreviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.title}>Token Found</Text>

      {tokenData && (
        <View style={styles.tokenPreview}>
          {tokenData.logoUri ? (
            <Image source={{ uri: tokenData.logoUri }} style={styles.tokenLogo} contentFit="cover" />
          ) : (
            <View style={[styles.tokenLogo, styles.tokenLogoFallback]}>
              <Text style={styles.tokenLogoText}>{tokenData.symbol.slice(0, 2)}</Text>
            </View>
          )}
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenSymbol}>{tokenData.symbol}</Text>
            <Text style={styles.tokenName}>{tokenData.name}</Text>
            {tokenData.priceUsd && (
              <Text style={styles.tokenPrice}>
                ${tokenData.priceUsd < 0.01 ? tokenData.priceUsd.toFixed(6) : tokenData.priceUsd.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      )}

      <Pressable
        style={styles.optionalSection}
        onPress={() => setStep('details')}
      >
        <Ionicons name="add-circle-outline" size={18} color={colors.textMuted} />
        <Text style={styles.optionalText}>Add amount & price (optional)</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </Pressable>

      <View style={styles.buttonRow}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => setStep('input')}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleAddToken}
        >
          <Text style={styles.primaryButtonText}>Add Token</Text>
        </Pressable>
      </View>
    </View>
  )

  const renderDetailsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.title}>Token Details</Text>
      <Text style={styles.subtitle}>Optional: Enter your balance and price</Text>

      <View style={styles.detailsForm}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Amount (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder={`0.00 ${tokenData?.symbol ?? ''}`}
            placeholderTextColor={colors.textMuted}
            value={manualAmount}
            onChangeText={setManualAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Price USD (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder={tokenData?.priceUsd ? `$${tokenData.priceUsd}` : '$0.00'}
            placeholderTextColor={colors.textMuted}
            value={manualPrice}
            onChangeText={setManualPrice}
            keyboardType="decimal-pad"
          />
          <Text style={styles.inputHint}>For pre-launch or unlisted tokens</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => setStep('preview')}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleAddToken}
        >
          <Text style={styles.primaryButtonText}>Add Token</Text>
        </Pressable>
      </View>
    </View>
  )

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

          {step === 'input' && renderInputStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'details' && renderDetailsStep()}
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
    minHeight: 320,
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
  stepContent: {
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  clearButton: {
    position: 'absolute',
    right: spacing.sm,
    padding: spacing.xs,
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
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tokenPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  tokenLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  tokenLogoFallback: {
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenLogoText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tokenInfo: {
    flex: 1,
    gap: 2,
  },
  tokenSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tokenName: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
  },
  tokenPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accentGreen,
    marginTop: 2,
  },
  optionalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.md,
  },
  optionalText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  detailsForm: {
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
  inputHint: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
    marginTop: 2,
  },
})
