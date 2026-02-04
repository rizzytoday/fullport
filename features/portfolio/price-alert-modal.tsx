import { useState, useEffect } from 'react'
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
import { Image } from 'expo-image'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius } from '@/constants/app-styles'
import { TokenHolding } from '@/stores/portfolio-store'
import { usePriceAlertsStore, AlertDirection } from '@/stores/price-alerts-store'
import { requestNotificationPermission, sendTestNotification } from '@/services/notification-service'
import * as Haptics from 'expo-haptics'
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated'

const isWeb = Platform.OS === 'web'

interface PriceAlertModalProps {
  visible: boolean
  onClose: () => void
  token: TokenHolding | null
}

export function PriceAlertModal({ visible, onClose, token }: PriceAlertModalProps) {
  const [direction, setDirection] = useState<AlertDirection>('above')
  const [targetPrice, setTargetPrice] = useState('')
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const { addAlert, getAlertsForToken } = usePriceAlertsStore()

  // Reset state when modal opens
  useEffect(() => {
    if (visible && token?.priceUsd) {
      // Default to 10% above/below current price
      const defaultTarget = direction === 'above'
        ? token.priceUsd * 1.1
        : token.priceUsd * 0.9
      setTargetPrice(formatPriceInput(defaultTarget))
    }
  }, [visible, token, direction])

  // Check notification permission
  useEffect(() => {
    if (visible && !isWeb) {
      requestNotificationPermission().then(setHasPermission)
    }
  }, [visible])

  const handleClose = () => {
    setTargetPrice('')
    setDirection('above')
    onClose()
  }

  const handleCreateAlert = async () => {
    if (!token || !targetPrice) return

    const price = parseFloat(targetPrice)
    if (isNaN(price) || price <= 0) {
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }

    // Request permission if not granted
    if (!hasPermission) {
      const granted = await requestNotificationPermission()
      setHasPermission(granted)
      if (granted) {
        await sendTestNotification()
      }
    }

    addAlert({
      mint: token.mint,
      symbol: token.symbol,
      name: token.name,
      logoUri: token.logoUri,
      targetPrice: price,
      direction,
      currentPriceAtCreation: token.priceUsd ?? 0,
    })

    if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    handleClose()
  }

  const existingAlerts = token ? getAlertsForToken(token.mint) : []
  const currentPrice = token?.priceUsd ?? null

  // Calculate percentage difference
  const percentDiff = currentPrice && targetPrice
    ? ((parseFloat(targetPrice) - currentPrice) / currentPrice) * 100
    : null

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
          entering={SlideInDown.springify().damping(18)}
          exiting={SlideOutDown.duration(200)}
          style={styles.modalContent}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </Pressable>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Price Alert</Text>

            {/* Token info */}
            {token && (
              <View style={styles.tokenRow}>
                {token.logoUri ? (
                  <Image source={{ uri: token.logoUri }} style={styles.tokenLogo} contentFit="cover" />
                ) : (
                  <View style={[styles.tokenLogo, styles.tokenLogoFallback]}>
                    <Text style={styles.tokenLogoText}>{token.symbol.slice(0, 2)}</Text>
                  </View>
                )}
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                  <Text style={styles.tokenPrice}>
                    Current: {formatDisplayPrice(currentPrice)}
                  </Text>
                </View>
              </View>
            )}

            {/* Direction selector */}
            <View style={styles.directionRow}>
              <Text style={styles.label}>Alert when price goes</Text>
              <View style={styles.directionButtons}>
                <Pressable
                  style={[
                    styles.directionButton,
                    direction === 'above' && styles.directionButtonActive,
                  ]}
                  onPress={() => {
                    setDirection('above')
                    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  }}
                >
                  <Ionicons
                    name="arrow-up"
                    size={16}
                    color={direction === 'above' ? colors.bgPrimary : colors.accentGreen}
                  />
                  <Text
                    style={[
                      styles.directionText,
                      direction === 'above' && styles.directionTextActive,
                    ]}
                  >
                    Above
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.directionButton,
                    direction === 'below' && styles.directionButtonActiveRed,
                  ]}
                  onPress={() => {
                    setDirection('below')
                    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  }}
                >
                  <Ionicons
                    name="arrow-down"
                    size={16}
                    color={direction === 'below' ? colors.bgPrimary : colors.accentRed}
                  />
                  <Text
                    style={[
                      styles.directionText,
                      direction === 'below' && styles.directionTextActive,
                    ]}
                  >
                    Below
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Target price input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Target Price</Text>
              <View style={styles.inputRow}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  value={targetPrice}
                  onChangeText={setTargetPrice}
                  keyboardType="decimal-pad"
                  autoFocus
                />
                {percentDiff !== null && !isNaN(percentDiff) && (
                  <View
                    style={[
                      styles.percentBadge,
                      { backgroundColor: percentDiff >= 0 ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.percentText,
                        { color: percentDiff >= 0 ? colors.accentGreen : colors.accentRed },
                      ]}
                    >
                      {percentDiff >= 0 ? '+' : ''}{percentDiff.toFixed(1)}%
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Quick presets */}
            <View style={styles.presets}>
              {[5, 10, 25, 50].map((pct) => {
                const multiplier = direction === 'above' ? 1 + pct / 100 : 1 - pct / 100
                const presetPrice = currentPrice ? currentPrice * multiplier : 0
                return (
                  <Pressable
                    key={pct}
                    style={({ pressed }) => [styles.presetButton, pressed && styles.presetButtonPressed]}
                    onPress={() => {
                      setTargetPrice(formatPriceInput(presetPrice))
                      if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    }}
                  >
                    <Text style={styles.presetText}>
                      {direction === 'above' ? '+' : '-'}{pct}%
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            {/* Existing alerts */}
            {existingAlerts.length > 0 && (
              <View style={styles.existingAlerts}>
                <Text style={styles.existingLabel}>Active alerts for {token?.symbol}</Text>
                {existingAlerts.map((alert) => (
                  <View key={alert.id} style={styles.existingAlert}>
                    <Ionicons
                      name={alert.direction === 'above' ? 'arrow-up' : 'arrow-down'}
                      size={14}
                      color={alert.direction === 'above' ? colors.accentGreen : colors.accentRed}
                    />
                    <Text style={styles.existingAlertText}>
                      {formatDisplayPrice(alert.targetPrice)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Permission warning */}
            {hasPermission === false && (
              <View style={styles.permissionWarning}>
                <Ionicons name="warning" size={16} color={colors.accentGold} />
                <Text style={styles.permissionText}>
                  Enable notifications in settings to receive price alerts
                </Text>
              </View>
            )}

            {/* Create button */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                !targetPrice && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleCreateAlert}
              disabled={!targetPrice}
            >
              <Ionicons name="notifications" size={18} color={colors.bgPrimary} />
              <Text style={styles.primaryButtonText}>Create Alert</Text>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

function formatDisplayPrice(price: number | null): string {
  if (price === null) return '--'
  if (price < 0.0001) return `$${price.toExponential(2)}`
  if (price < 0.01) return `$${price.toFixed(6)}`
  if (price < 1) return `$${price.toFixed(4)}`
  return `$${price.toFixed(2)}`
}

function formatPriceInput(price: number): string {
  if (price < 0.0001) return price.toExponential(2)
  if (price < 0.01) return price.toFixed(6)
  if (price < 1) return price.toFixed(4)
  return price.toFixed(2)
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
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  tokenLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  tokenLogoFallback: {
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenLogoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tokenInfo: {
    flex: 1,
    gap: 2,
  },
  tokenSymbol: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tokenPrice: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
  },
  directionRow: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  directionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  directionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  directionButtonActive: {
    backgroundColor: colors.accentGreen,
    borderColor: colors.accentGreen,
  },
  directionButtonActiveRed: {
    backgroundColor: colors.accentRed,
    borderColor: colors.accentRed,
  },
  directionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  directionTextActive: {
    color: colors.bgPrimary,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing.md,
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textMuted,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: colors.textPrimary,
    paddingVertical: 14,
  },
  percentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  percentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  presets: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  presetButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.sm,
  },
  presetButtonPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.98 }],
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  existingAlerts: {
    gap: spacing.sm,
  },
  existingLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  existingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.glassBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  existingAlertText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  permissionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
    color: colors.accentGold,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
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
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
})
