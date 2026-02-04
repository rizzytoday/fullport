import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useCallback } from 'react'
import * as LocalAuthentication from 'expo-local-authentication'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Defs, Filter, FeGaussianBlur, FeFlood, FeComposite, FeMerge, FeMergeNode, Rect, G, Path } from 'react-native-svg'
import { colors, spacing, borderRadius, typography } from '@/constants/app-styles'
import { useAuthStore } from '@/stores/auth-store'
import { useSettingsStore } from '@/stores/settings-store'
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated'

const isWeb = Platform.OS === 'web'

// Fullport Logo Component
function FullportLogo({ size = 80 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 128 128">
      <Defs>
        <Filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <FeGaussianBlur stdDeviation="4" result="blur" />
          <FeFlood floodColor="#9945FF" floodOpacity="0.5" />
          <FeComposite in2="blur" operator="in" />
          <FeMerge>
            <FeMergeNode />
            <FeMergeNode in="SourceGraphic" />
          </FeMerge>
        </Filter>
      </Defs>
      {/* Background */}
      <Rect width="128" height="128" rx="28" fill="#000" />
      {/* Briefcase with glow */}
      <G filter="url(#glow)">
        <Rect x="26" y="44" width="76" height="52" rx="6" fill="#9945FF" />
        <Path
          d="M48 44 V36 Q48 30 54 30 H74 Q80 30 80 36 V44"
          stroke="#9945FF"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
      </G>
      {/* Clasp */}
      <Rect x="54" y="66" width="20" height="8" rx="2" fill="#000" opacity="0.25" />
    </Svg>
  )
}

export function LockScreen() {
  const { setAuthenticated, isAuthenticating, setAuthenticating } = useAuthStore()
  const { biometricEnabled } = useSettingsStore()

  const authenticate = useCallback(async () => {
    if (isWeb) {
      setAuthenticated(true)
      return
    }

    // Check if biometric is available
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    const isEnrolled = await LocalAuthentication.isEnrolledAsync()

    if (!hasHardware || !isEnrolled) {
      // No biometric available, authenticate automatically
      setAuthenticated(true)
      return
    }

    setAuthenticating(true)

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Fullport',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
      })

      if (result.success) {
        if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        setAuthenticated(true)
      } else {
        if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
    } catch (error) {
      console.error('Biometric auth error:', error)
    } finally {
      setAuthenticating(false)
    }
  }, [setAuthenticated, setAuthenticating])

  // Auto-authenticate on mount if biometric is enabled
  useEffect(() => {
    if (biometricEnabled && !isWeb) {
      // Small delay to let the UI render first
      const timer = setTimeout(() => {
        authenticate()
      }, 500)
      return () => clearTimeout(timer)
    } else {
      // If biometric not enabled, authenticate immediately
      setAuthenticated(true)
    }
  }, [biometricEnabled, authenticate, setAuthenticated])

  const handleUnlock = () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    authenticate()
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.content}>
        {/* Logo */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.logoContainer}>
          <FullportLogo size={100} />
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.textContainer}>
          <Text style={styles.title}>Fullport</Text>
          <Text style={styles.subtitle}>Your portfolio is locked</Text>
        </Animated.View>

        {/* Unlock Button */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <Pressable
            style={({ pressed }) => [
              styles.unlockButton,
              pressed && styles.unlockButtonPressed,
              isAuthenticating && styles.unlockButtonDisabled,
            ]}
            onPress={handleUnlock}
            disabled={isAuthenticating}
          >
            <Ionicons
              name="finger-print"
              size={28}
              color={colors.textPrimary}
            />
            <Text style={styles.unlockText}>
              {isAuthenticating ? 'Authenticating...' : 'Tap to Unlock'}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Security Note */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.noteContainer}>
          <Ionicons name="shield-checkmark" size={16} color={colors.accentGreen} />
          <Text style={styles.noteText}>
            Protected with biometric authentication
          </Text>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  textContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.displayLarge,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.glassBg,
    borderColor: colors.accentPurple + '50',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  unlockButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  unlockButtonDisabled: {
    opacity: 0.6,
  },
  unlockText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  noteText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
})
