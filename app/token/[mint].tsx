import { View, StyleSheet, Pressable, ScrollView, Platform } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing } from '@/constants/app-styles'
import { usePortfolioStore } from '@/stores/portfolio-store'
import { TokenDetail } from '@/features/portfolio/token-detail'
import * as Haptics from 'expo-haptics'

const isWeb = Platform.OS === 'web'

export default function TokenDetailScreen() {
  const { mint } = useLocalSearchParams<{ mint: string }>()
  const insets = useSafeAreaInsets()
  const { holdings } = usePortfolioStore()

  // Find the token from holdings
  const token = holdings.find((h) => h.mint === mint)

  const handleBack = () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.back()
  }

  if (!token) {
    // Token not found, go back
    router.back()
    return null
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Header with back button */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Token Detail Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TokenDetail token={token} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: colors.glassBgHover,
    transform: [{ scale: 0.95 }],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
})
