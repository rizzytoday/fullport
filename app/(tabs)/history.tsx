import { View, Text, RefreshControl, FlatList, Platform, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { appStyles, colors, spacing } from '@/constants/app-styles'
import { ConnectWalletCard } from '@/features/portfolio/connect-wallet-card'
import { TransactionItem, Transaction } from '@/features/history/transaction-item'
import { useTransactionHistory } from '@/features/history/use-transaction-history'
import { DEMO_MODE } from '@/constants/mock-data'
import { useCallback, useState } from 'react'
import * as Haptics from 'expo-haptics'
import Animated, { FadeIn } from 'react-native-reanimated'

const isWeb = Platform.OS === 'web'

export default function HistoryScreen() {
  const wallet = isWeb ? null : useMobileWallet()
  const account = wallet?.account
  const { transactions, isLoading, refresh } = useTransactionHistory(account?.address)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }, [refresh])

  const renderHeader = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
      <Text style={styles.title}>History</Text>
      {transactions.length > 0 && (
        <Text style={styles.count}>{transactions.length}</Text>
      )}
    </Animated.View>
  )

  const renderSeparator = () => <View style={styles.separator} />

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        {isLoading ? 'Loading...' : 'No transactions yet'}
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={[appStyles.screen, isWeb && { paddingTop: 40 }]} edges={['top']}>
      {(account || DEMO_MODE) ? (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.signature}
          renderItem={({ item, index }) => (
            <TransactionItem transaction={item} index={index} />
          )}
          ListHeaderComponent={renderHeader}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.textPrimary}
            />
          }
        />
      ) : (
        <View style={styles.connectContainer}>
          {renderHeader()}
          <ConnectWalletCard />
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  count: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textMuted,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  separator: {
    height: 1,
    backgroundColor: colors.glassBorder,
    marginLeft: 38, // Align with content after dot+logo
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textMuted,
  },
  connectContainer: {
    paddingHorizontal: spacing.lg,
  },
})
