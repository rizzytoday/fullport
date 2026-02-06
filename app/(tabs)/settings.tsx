import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Pressable, Linking, Switch, Platform, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as LocalAuthentication from 'expo-local-authentication'
import { appStyles, colors, spacing, borderRadius } from '@/constants/app-styles'
import { useSettingsStore } from '@/stores/settings-store'
import { useWatchedWalletsStore } from '@/stores/watched-wallets-store'
import { usePriceAlertsStore } from '@/stores/price-alerts-store'
import { AddWatchedWalletModal } from '@/features/settings/add-watched-wallet-modal'
import { getNotificationPermissionStatus, requestNotificationPermission, sendTestNotification } from '@/services/notification-service'
import * as Haptics from 'expo-haptics'
import Constants from 'expo-constants'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

const isWeb = Platform.OS === 'web'

interface SettingRowProps {
  label: string
  value?: string
  onPress?: () => void
  rightElement?: React.ReactNode
  destructive?: boolean
}

function SettingRow({ label, value, onPress, rightElement, destructive }: SettingRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingRow,
        pressed && onPress && styles.settingRowPressed,
      ]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <Text style={[styles.settingLabel, destructive && styles.destructiveText]}>
        {label}
      </Text>
      {rightElement || (value && (
        <Text style={styles.settingValue}>{value}</Text>
      ))}
    </Pressable>
  )
}

interface SectionProps {
  title: string
  children: React.ReactNode
  index: number
}

function Section({ title, children, index }: SectionProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
      style={styles.section}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </Animated.View>
  )
}

export default function SettingsScreen() {
  const wallet = isWeb ? null : useMobileWallet()
  const account = wallet?.account
  const [showAddWalletModal, setShowAddWalletModal] = useState(false)
  const [notificationStatus, setNotificationStatus] = useState<string>('unknown')
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricType, setBiometricType] = useState<string>('Biometric')

  const { biometricEnabled, setBiometricEnabled, hapticEnabled, setHapticEnabled } =
    useSettingsStore()

  const { wallets, aggregateMode, setAggregateMode, removeWallet } = useWatchedWalletsStore()
  const { alerts, removeAlert, clearTriggered } = usePriceAlertsStore()

  // Check notification permission and biometric availability
  useEffect(() => {
    getNotificationPermissionStatus().then(setNotificationStatus)

    if (!isWeb) {
      // Check biometric hardware
      LocalAuthentication.hasHardwareAsync().then(async (hasHardware) => {
        if (hasHardware) {
          const isEnrolled = await LocalAuthentication.isEnrolledAsync()
          setBiometricAvailable(isEnrolled)

          // Determine biometric type
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
          if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setBiometricType('Face ID')
          } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setBiometricType('Fingerprint')
          }
        }
      })
    }
  }, [])

  const activeAlerts = alerts.filter((a) => !a.triggered)
  const triggeredAlerts = alerts.filter((a) => a.triggered)

  const handleDisconnect = async () => {
    if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    await wallet?.disconnect()
  }

  const toggleBiometric = () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setBiometricEnabled(!biometricEnabled)
  }

  const toggleHaptic = () => {
    if (!hapticEnabled && !isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
    setHapticEnabled(!hapticEnabled)
  }

  const toggleAggregateMode = () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setAggregateMode(!aggregateMode)
  }

  const handleAddWallet = () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setShowAddWalletModal(true)
  }

  const handleRemoveWallet = (id: string) => {
    if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    removeWallet(id)
  }

  const handleRemoveAlert = (id: string) => {
    if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    removeAlert(id)
  }

  const handleEnableNotifications = async () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const granted = await requestNotificationPermission()
    setNotificationStatus(granted ? 'granted' : 'denied')
    if (granted) {
      await sendTestNotification()
    }
  }

  const handleClearTriggered = () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    clearTriggered()
  }

  return (
    <SafeAreaView style={[appStyles.screen, isWeb && { paddingTop: 40 }]} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </Animated.View>

        {/* Security */}
        <Section title="Security" index={0}>
          <SettingRow
            label={biometricType}
            rightElement={
              biometricAvailable ? (
                <Switch
                  value={biometricEnabled}
                  onValueChange={toggleBiometric}
                  trackColor={{ false: colors.glassBg, true: colors.accentGreen }}
                  thumbColor={colors.textPrimary}
                />
              ) : (
                <Text style={styles.settingValue}>Not available</Text>
              )
            }
          />
          {biometricEnabled && biometricAvailable && (
            <>
              <View style={styles.rowSeparator} />
              <View style={styles.securityNote}>
                <Ionicons name="shield-checkmark" size={16} color={colors.accentGreen} />
                <Text style={styles.securityNoteText}>
                  App locks after 5 seconds in background
                </Text>
              </View>
            </>
          )}
        </Section>

        {/* Preferences */}
        <Section title="Preferences" index={1}>
          <SettingRow
            label="Haptic Feedback"
            rightElement={
              <Switch
                value={hapticEnabled}
                onValueChange={toggleHaptic}
                trackColor={{ false: colors.glassBg, true: colors.accentGreen }}
                thumbColor={colors.textPrimary}
              />
            }
          />
          <View style={styles.rowSeparator} />
          <SettingRow
            label="Notifications"
            value={notificationStatus === 'granted' ? 'On' : 'Off'}
            onPress={notificationStatus !== 'granted' ? handleEnableNotifications : undefined}
            rightElement={
              notificationStatus === 'granted' ? (
                <Ionicons name="checkmark-circle" size={20} color={colors.accentGreen} />
              ) : undefined
            }
          />
        </Section>

        {/* Price Alerts */}
        <Section title="Price Alerts" index={2}>
          {activeAlerts.length === 0 && triggeredAlerts.length === 0 ? (
            <View style={styles.emptyAlerts}>
              <Ionicons name="notifications-outline" size={24} color={colors.textMuted} />
              <Text style={styles.emptyAlertsText}>
                Press and hold any token to create a price alert
              </Text>
            </View>
          ) : (
            <>
              {activeAlerts.map((alert, index) => (
                <View key={alert.id}>
                  {index > 0 && <View style={styles.rowSeparator} />}
                  <View style={styles.alertRow}>
                    {alert.logoUri ? (
                      <Image source={{ uri: alert.logoUri }} style={styles.alertLogo} contentFit="cover" />
                    ) : (
                      <View style={[styles.alertLogo, styles.alertLogoFallback]}>
                        <Text style={styles.alertLogoText}>{alert.symbol.slice(0, 2)}</Text>
                      </View>
                    )}
                    <View style={styles.alertInfo}>
                      <Text style={styles.alertSymbol}>{alert.symbol}</Text>
                      <View style={styles.alertTarget}>
                        <Ionicons
                          name={alert.direction === 'above' ? 'arrow-up' : 'arrow-down'}
                          size={12}
                          color={alert.direction === 'above' ? colors.accentGreen : colors.accentRed}
                        />
                        <Text style={styles.alertPrice}>
                          ${alert.targetPrice < 1 ? alert.targetPrice.toFixed(4) : alert.targetPrice.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      style={({ pressed }) => [styles.removeButton, pressed && { opacity: 0.6 }]}
                      onPress={() => handleRemoveAlert(alert.id)}
                    >
                      <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                    </Pressable>
                  </View>
                </View>
              ))}
              {triggeredAlerts.length > 0 && (
                <>
                  {activeAlerts.length > 0 && <View style={styles.rowSeparator} />}
                  <SettingRow
                    label={`Clear ${triggeredAlerts.length} triggered alert${triggeredAlerts.length > 1 ? 's' : ''}`}
                    onPress={handleClearTriggered}
                    rightElement={<Ionicons name="trash-outline" size={18} color={colors.textMuted} />}
                  />
                </>
              )}
            </>
          )}
        </Section>

        {/* Watched Wallets */}
        <Section title="Watched Wallets" index={3}>
          {wallets.length > 0 && (
            <>
              <SettingRow
                label="Combined View"
                rightElement={
                  <Switch
                    value={aggregateMode}
                    onValueChange={toggleAggregateMode}
                    trackColor={{ false: colors.glassBg, true: colors.accentGreen }}
                    thumbColor={colors.textPrimary}
                  />
                }
              />
              <View style={styles.rowSeparator} />
            </>
          )}
          {wallets.map((wallet, index) => (
            <View key={wallet.id}>
              {index > 0 && <View style={styles.rowSeparator} />}
              <View style={styles.walletRow}>
                <View style={[styles.walletColorDot, { backgroundColor: wallet.color }]} />
                <View style={styles.walletInfo}>
                  <Text style={styles.walletLabel}>{wallet.label}</Text>
                  <Text style={styles.walletAddress}>
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.removeButton,
                    pressed && { opacity: 0.6 },
                  ]}
                  onPress={() => handleRemoveWallet(wallet.id)}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </Pressable>
              </View>
            </View>
          ))}
          {wallets.length > 0 && <View style={styles.rowSeparator} />}
          <SettingRow
            label="Add Wallet"
            onPress={handleAddWallet}
            rightElement={<Ionicons name="add" size={20} color={colors.textMuted} />}
          />
        </Section>

        {/* Network */}
        <Section title="Network" index={4}>
          <SettingRow
            label="RPC Endpoint"
            value="Helius"
            onPress={() => {}}
          />
        </Section>

        {/* Account */}
        {account && (
          <Section title="Account" index={5}>
            <SettingRow
              label="Wallet"
              value={`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
            />
            <View style={styles.rowSeparator} />
            <SettingRow
              label="Disconnect"
              onPress={handleDisconnect}
              destructive
            />
          </Section>
        )}

        {/* About */}
        <Section title="About" index={account ? 6 : 5}>
          <SettingRow
            label="Version"
            value={Constants.expoConfig?.version ?? '1.0.0'}
          />
          <View style={styles.rowSeparator} />
          <SettingRow
            label="GitHub"
            onPress={() => Linking.openURL('https://github.com/fullport')}
          />
          <View style={styles.rowSeparator} />
          <SettingRow
            label="Twitter"
            onPress={() => Linking.openURL('https://twitter.com/fullport')}
          />
        </Section>

        {/* Footer */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(300)}
          style={styles.footer}
        >
          <Text style={styles.footerText}>Built for Solana Mobile</Text>
          <Text style={styles.footerAccent}>MONOLITH 2026</Text>
        </Animated.View>
      </ScrollView>

      {/* Add Wallet Modal */}
      <AddWatchedWalletModal
        visible={showAddWalletModal}
        onClose={() => setShowAddWalletModal(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  sectionContent: {
    backgroundColor: colors.glassBg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  settingRowPressed: {
    opacity: 0.6,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  settingValue: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textMuted,
  },
  destructiveText: {
    color: colors.accentRed,
  },
  rowSeparator: {
    height: 1,
    backgroundColor: colors.glassBorder,
    marginLeft: spacing.md,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  walletColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  walletInfo: {
    flex: 1,
    gap: 1,
  },
  walletLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  walletAddress: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
  removeButton: {
    padding: spacing.xs,
  },
  emptyAlerts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  emptyAlertsText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
    lineHeight: 20,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  alertLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  alertLogoFallback: {
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertLogoText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  alertInfo: {
    flex: 1,
    gap: 2,
  },
  alertSymbol: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  alertTarget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  alertPrice: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textMuted,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  securityNoteText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textMuted,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textMuted,
  },
  footerAccent: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accentPurple,
    letterSpacing: 1,
  },
})
