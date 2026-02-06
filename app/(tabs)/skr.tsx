import { View, Text, ScrollView, RefreshControl, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { appStyles, colors, spacing } from '@/constants/app-styles'
import { ConnectWalletCard } from '@/features/portfolio/connect-wallet-card'
import { SkrBalanceCard } from '@/features/skr/skr-balance-card'
import { StakingCard } from '@/features/skr/staking-card'
import { ProjectedRewards } from '@/features/skr/projected-rewards'
import { StakingModal } from '@/features/skr/staking-modal'
import { GuardianSelectModal } from '@/features/skr/guardian-select-modal'
import { useSkrData } from '@/features/skr/use-skr-data'
import { DEMO_MODE } from '@/constants/mock-data'
import { useCallback, useState } from 'react'
import * as Haptics from 'expo-haptics'

const isWeb = Platform.OS === 'web'

type ModalMode = 'stake' | 'unstake' | null

export default function SkrScreen() {
  const wallet = isWeb ? null : useMobileWallet()
  const account = wallet?.account
  const { refetch } = useSkrData()
  const [refreshing, setRefreshing] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [showGuardianModal, setShowGuardianModal] = useState(false)

  const onRefresh = useCallback(async () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const handleStake = () => {
    setModalMode('stake')
  }

  const handleUnstake = () => {
    setModalMode('unstake')
  }

  const handleModalClose = () => {
    setModalMode(null)
  }

  const handleStakingSuccess = () => {
    refetch()
  }

  const handleChangeGuardian = () => {
    setShowGuardianModal(true)
  }

  const handleGuardianSelect = (guardian: { name: string; address: string }) => {
    console.log('Selected guardian:', guardian.name)
    refetch()
  }

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
          <View style={{ gap: spacing.xl, paddingTop: spacing.lg }}>
            <SkrBalanceCard />
            <StakingCard
              onStake={handleStake}
              onUnstake={handleUnstake}
              onChangeGuardian={handleChangeGuardian}
            />
            <ProjectedRewards />
          </View>
        ) : (
          <View style={{ paddingTop: spacing.xl }}>
            <ConnectWalletCard />
          </View>
        )}
      </ScrollView>

      {/* Staking Modal */}
      <StakingModal
        visible={modalMode !== null}
        mode={modalMode ?? 'stake'}
        onClose={handleModalClose}
        onSuccess={handleStakingSuccess}
      />

      {/* Guardian Select Modal */}
      <GuardianSelectModal
        visible={showGuardianModal}
        onClose={() => setShowGuardianModal(false)}
        onSelect={handleGuardianSelect}
      />
    </SafeAreaView>
  )
}
