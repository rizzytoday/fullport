import { View, Text, StyleSheet, Pressable, Linking, Platform } from 'react-native'
import { Image } from 'expo-image'
import { colors, spacing } from '@/constants/app-styles'
import Animated, { FadeInDown } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Transaction, TransactionType } from '@/constants/mock-data'

const isWeb = Platform.OS === 'web'

// Re-export Transaction type
export type { Transaction } from '@/constants/mock-data'

// Transaction type config - minimal labels
const TX_CONFIG: Record<TransactionType, {
  color: string
  label: string
  prefix: string
}> = {
  swap: { color: '#3b82f6', label: 'Swap', prefix: '' },
  transfer_in: { color: colors.accentGreen, label: 'Received', prefix: '+' },
  transfer_out: { color: colors.accentRed, label: 'Sent', prefix: '-' },
  stake: { color: colors.accentPurple, label: 'Staked', prefix: '' },
  unstake: { color: '#f59e0b', label: 'Unstaked', prefix: '' },
  claim: { color: colors.accentGreen, label: 'Claimed', prefix: '+' },
  airdrop: { color: '#ec4899', label: 'Airdrop', prefix: '+' },
}

function formatTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`
  if (amount < 0.01 && amount > 0) return amount.toFixed(4)
  return amount.toFixed(2)
}

function formatUsd(value: number | undefined): string {
  if (!value) return ''
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

// Default config for unknown types
const DEFAULT_CONFIG = { color: '#6b7280', label: 'Transaction', prefix: '' }

export function TransactionItem({
  transaction,
  index,
}: {
  transaction: Transaction
  index: number
}) {
  const config = TX_CONFIG[transaction.type] || DEFAULT_CONFIG

  const handlePress = () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Linking.openURL(`https://solscan.io/tx/${transaction.signature}`)
  }

  // Get primary token info
  const getTokenInfo = () => {
    if (transaction.type === 'swap' && transaction.fromToken && transaction.toToken) {
      return {
        fromSymbol: transaction.fromToken.symbol,
        fromAmount: formatAmount(transaction.fromToken.amount),
        toSymbol: transaction.toToken.symbol,
        toAmount: formatAmount(transaction.toToken.amount),
        isSwap: true,
      }
    }
    if (transaction.token) {
      return {
        symbol: transaction.token.symbol,
        amount: formatAmount(transaction.token.amount),
        logoUri: transaction.token.logoUri,
        isSwap: false,
      }
    }
    return null
  }

  const tokenInfo = getTokenInfo()

  return (
    <Animated.View entering={FadeInDown.delay(index * 30).duration(300)}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          pressed && styles.pressed,
        ]}
        onPress={handlePress}
      >
        {/* Left: Type indicator dot + Logo */}
        <View style={styles.leftSection}>
          <View style={[styles.typeDot, { backgroundColor: config.color }]} />
          {tokenInfo && !tokenInfo.isSwap && tokenInfo.logoUri && (
            <Image source={{ uri: tokenInfo.logoUri }} style={styles.tokenLogo} />
          )}
        </View>

        {/* Center: Type + Token info */}
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.typeLabel}>{config.label}</Text>
            <Text style={styles.timeText}>{formatTime(transaction.timestamp)}</Text>
          </View>
          <View style={styles.bottomRow}>
            {tokenInfo?.isSwap ? (
              <Text style={styles.swapText}>
                {tokenInfo.fromAmount} {tokenInfo.fromSymbol} → {tokenInfo.toAmount} {tokenInfo.toSymbol}
              </Text>
            ) : tokenInfo ? (
              <Text style={[styles.amountText, { color: config.color }]}>
                {config.prefix}{tokenInfo.amount} {tokenInfo.symbol}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Right: Value */}
        <View style={styles.valueSection}>
          {transaction.valueUsd && (
            <Text style={styles.valueText}>{formatUsd(transaction.valueUsd)}</Text>
          )}
          <View style={[styles.statusDot, {
            backgroundColor: transaction.status === 'confirmed' ? colors.accentGreen : colors.accentRed
          }]} />
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.6,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tokenLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swapText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  valueSection: {
    alignItems: 'flex-end',
    gap: 4,
  },
  valueText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
})
