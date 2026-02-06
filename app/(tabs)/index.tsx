import { View, ScrollView, RefreshControl, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { appStyles, colors, spacing } from '@/constants/app-styles'
import { PortfolioHeader } from '@/features/portfolio/portfolio-header'
import { PortfolioHistoryChart } from '@/features/portfolio/portfolio-history-chart'
import { AllocationChart } from '@/features/portfolio/allocation-chart'
import { HoldingsList } from '@/features/portfolio/holdings-list'
import { AIInsights } from '@/features/portfolio/ai-insights'
import { IncomeSummaryMini } from '@/features/portfolio/income-summary-mini'
import { ConnectWalletCard } from '@/features/portfolio/connect-wallet-card'
import { usePortfolioData } from '@/features/portfolio/use-portfolio-data'
import { useSkrData } from '@/features/skr/use-skr-data'
import { usePortfolioStore } from '@/stores/portfolio-store'
import { usePortfolioHistoryStore } from '@/stores/portfolio-history-store'
import { DEMO_MODE } from '@/constants/mock-data'
import { Toast } from '@/components/toast'
import { useCallback, useState, useEffect, useRef } from 'react'
import * as Haptics from 'expo-haptics'

const isWeb = Platform.OS === 'web'

export default function PortfolioScreen() {
  // Use wallet hook on mobile, null on web
  const wallet = isWeb ? null : useMobileWallet()
  const account = wallet?.account

  const { refetch, isLoading } = usePortfolioData()
  useSkrData() // Load SKR data for AI Insights
  const [refreshing, setRefreshing] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showChart, setShowChart] = useState(false)

  // Portfolio data for history snapshots
  const { holdings, totalValueUsd } = usePortfolioStore()
  const addSnapshot = usePortfolioHistoryStore((s) => s.addSnapshot)

  // Record portfolio snapshot when data is loaded
  useEffect(() => {
    if (!isLoading && holdings.length > 0 && totalValueUsd > 0) {
      addSnapshot({
        timestamp: Date.now(),
        totalValueUsd,
        holdings: holdings.map((h) => ({
          mint: h.mint,
          symbol: h.symbol,
          valueUsd: h.valueUsd ?? 0,
        })),
      })
    }
  }, [isLoading, holdings, totalValueUsd, addSnapshot])

  const onRefresh = useCallback(async () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const handleAlertCreated = useCallback((symbol: string, direction: string, price: string) => {
    const arrow = direction === 'above' ? '↑' : '↓'
    setToastMessage(`${symbol} alert ${arrow} $${price}`)
    setToastVisible(true)
  }, [])

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
        {(account || DEMO_MODE) ? (
          <View style={{ gap: spacing.xl }}>
            <PortfolioHeader onChartPress={() => setShowChart(!showChart)} />
            {showChart && <PortfolioHistoryChart />}
            <AllocationChart />
            <HoldingsList showEmptyState onRetry={onRefresh} onAlertCreated={handleAlertCreated} />
            <AIInsights />
            <IncomeSummaryMini />
          </View>
        ) : (
          <View style={{ paddingTop: spacing.xl }}>
            <ConnectWalletCard />
          </View>
        )}
      </ScrollView>

      {/* Toast notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type="success"
        duration={2000}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  )
}
