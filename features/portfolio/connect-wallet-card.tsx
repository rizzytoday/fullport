import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'
import { colors, spacing } from '@/constants/app-styles'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import * as Haptics from 'expo-haptics'

const isWeb = Platform.OS === 'web'

export function ConnectWalletCard() {
  // Only use wallet hook on mobile
  const wallet = isWeb ? null : useMobileWallet()

  const handleConnect = async () => {
    if (isWeb) {
      alert('Wallet connection requires Android device with Phantom/Solflare')
      return
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      await wallet?.connect()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      {/* Icon */}
      <Animated.View entering={FadeInDown.delay(50).duration(300)} style={styles.iconWrapper}>
        <View style={styles.iconCircle}>
          <Ionicons name="wallet-outline" size={28} color={colors.textPrimary} />
        </View>
      </Animated.View>

      {/* Text */}
      <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.textSection}>
        <Text style={styles.title}>Connect Wallet</Text>
        <Text style={styles.subtitle}>
          View your portfolio and track SKR staking rewards
        </Text>
      </Animated.View>

      {/* Connect Button */}
      <Animated.View entering={FadeInDown.delay(150).duration(300)} style={styles.buttonWrapper}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleConnect}
        >
          <Text style={styles.buttonText}>Connect</Text>
        </Pressable>
      </Animated.View>

      {/* Supported Wallets */}
      <Animated.View entering={FadeInDown.delay(200).duration(300)} style={styles.walletInfo}>
        <Text style={styles.supportsText}>
          Phantom, Solflare, Seed Vault
        </Text>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.lg,
  },
  iconWrapper: {},
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSection: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 22,
  },
  buttonWrapper: {
    marginTop: spacing.sm,
  },
  button: {
    backgroundColor: colors.textPrimary,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.bgPrimary,
    letterSpacing: -0.2,
  },
  walletInfo: {
    marginTop: spacing.sm,
  },
  supportsText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  },
})
