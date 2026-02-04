import { View, ScrollView, RefreshControl, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { appStyles, colors, spacing } from '@/constants/app-styles'
import { PortfolioHeader } from '@/features/portfolio/portfolio-header'
import { AllocationChart } from '@/features/portfolio/allocation-chart'
import { MissionProgress } from '@/features/portfolio/mission-progress'
import { HoldingsList } from '@/features/portfolio/holdings-list'
import { ConnectWalletCard } from '@/features/portfolio/connect-wallet-card'
import { usePortfolioData } from '@/features/portfolio/use-portfolio-data'
import { useCallback, useState } from 'react'
import * as Haptics from 'expo-haptics'

const isWeb = Platform.OS === 'web'

export default function PortfolioScreen() {
  // Use wallet hook on mobile, null on web
  const wallet = isWeb ? null : useMobileWallet()
  const account = wallet?.account

  const { refetch } = usePortfolioData()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  return (
    <SafeAreaView style={[appStyles.screen, isWeb && { paddingTop: 40 }]} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textPrimary}
          />
        }
      >
        {account ? (
          <View style={{ gap: spacing.xl }}>
            <View>
              <PortfolioHeader />
              <MissionProgress />
            </View>
            <AllocationChart />
            <HoldingsList showEmptyState onRetry={onRefresh} />
          </View>
        ) : (
          <View style={{ paddingTop: spacing.xl }}>
            <ConnectWalletCard />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
