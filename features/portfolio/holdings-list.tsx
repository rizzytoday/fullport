import { useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { usePortfolioStore, TokenHolding } from '@/stores/portfolio-store'
import { usePriceAlertsStore } from '@/stores/price-alerts-store'
import { colors, spacing } from '@/constants/app-styles'
import { Sparkline } from '@/components/sparkline'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { AddTokenModal } from './add-token-modal'
import { PriceAlertModal } from './price-alert-modal'
import Animated, { FadeInDown } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

const isWeb = Platform.OS === 'web'

function formatAmount(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(2)}K`
  if (amount < 1) return amount.toFixed(4)
  return amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function formatPrice(price: number | null): string {
  if (price === null) return '--'
  if (price < 0.0001) return `$${price.toExponential(2)}`
  if (price < 0.01) return `$${price.toFixed(6)}`
  if (price < 1) return `$${price.toFixed(4)}`
  return `$${price.toFixed(2)}`
}

function formatValue(value: number | null): string {
  if (value === null) return '--'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

interface HoldingItemProps {
  holding: TokenHolding
  index: number
  onAlertPress: (token: TokenHolding) => void
  hasAlert: boolean
}

function HoldingItem({ holding, index, onAlertPress, hasAlert }: HoldingItemProps) {
  const isPositive = (holding.change24h ?? 0) >= 0

  const handlePress = () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleAlertPress = () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onAlertPress(holding)
  }

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(400)}>
      <Pressable
        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        onPress={handlePress}
        onLongPress={handleAlertPress}
      >
        {/* Logo */}
        {holding.logoUri ? (
          <Image source={{ uri: holding.logoUri }} style={styles.logo} contentFit="cover" />
        ) : (
          <View style={[styles.logo, styles.logoFallback]}>
            <Text style={styles.logoText}>{holding.symbol.slice(0, 2)}</Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.symbol}>{holding.symbol}</Text>
          <Text style={styles.price}>{formatPrice(holding.priceUsd)}</Text>
        </View>

        {/* Sparkline */}
        <View style={styles.chartWrapper}>
          {holding.priceHistory && holding.priceHistory.length > 0 && (
            <Sparkline
              data={holding.priceHistory}
              width={56}
              height={24}
              strokeWidth={1.5}
              showGradient={false}
            />
          )}
        </View>

        {/* Value */}
        <View style={styles.valueSection}>
          <Text style={styles.value}>{formatValue(holding.valueUsd)}</Text>
          {holding.change24h !== null && (
            <Text
              style={[styles.change, { color: isPositive ? colors.accentGreen : colors.accentRed }]}
            >
              {isPositive ? '+' : ''}{holding.change24h.toFixed(1)}%
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  )
}

interface HoldingsListProps {
  showEmptyState?: boolean
  onRetry?: () => void
}

export function HoldingsList({ showEmptyState = false, onRetry }: HoldingsListProps) {
  const { holdings, isLoading, error } = usePortfolioStore()
  const { alerts } = usePriceAlertsStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [selectedToken, setSelectedToken] = useState<TokenHolding | null>(null)

  const handleAddPress = () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setShowAddModal(true)
  }

  const handleAlertPress = (token: TokenHolding) => {
    setSelectedToken(token)
    setShowAlertModal(true)
  }

  // Check if token has active alerts
  const hasAlertForMint = (mint: string) =>
    alerts.some((a) => a.mint === mint && !a.triggered)

  // Show error state
  if (error && holdings.length === 0) {
    return (
      <ErrorState
        title="Failed to load portfolio"
        message={error}
        onRetry={onRetry}
      />
    )
  }

  // Still loading
  if (isLoading && holdings.length === 0) return null

  // Show empty state when wallet connected but no tokens
  if (holdings.length === 0 && showEmptyState) {
    return (
      <>
        <EmptyState
          icon="wallet-outline"
          title="No tokens yet"
          description="Your portfolio is empty. Add tokens manually or receive some to get started."
          actionLabel="Add Token"
          onAction={handleAddPress}
        />
        <AddTokenModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
      </>
    )
  }

  if (holdings.length === 0) return null

  return (
    <View style={styles.container}>
      {/* Thin separator line */}
      <View style={styles.separator} />

      {/* Section header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionLabel}>Assets</Text>
          <Text style={styles.countLabel}>{holdings.length}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          onPress={handleAddPress}
        >
          <Ionicons name="add" size={18} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Add Token Modal */}
      <AddTokenModal visible={showAddModal} onClose={() => setShowAddModal(false)} />

      {/* Price Alert Modal */}
      <PriceAlertModal
        visible={showAlertModal}
        onClose={() => {
          setShowAlertModal(false)
          setSelectedToken(null)
        }}
        token={selectedToken}
      />

      {/* Holdings */}
      <View style={styles.list}>
        {holdings.map((holding, index) => (
          <HoldingItem
            key={holding.mint}
            holding={holding}
            index={index}
            onAlertPress={handleAlertPress}
            hasAlert={hasAlertForMint(holding.mint)}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: colors.glassBorder,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  list: {
    gap: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    gap: spacing.md,
    borderRadius: 12,
  },
  itemPressed: {
    backgroundColor: colors.glassBg,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoFallback: {
    backgroundColor: colors.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  price: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textMuted,
  },
  chartWrapper: {
    width: 56,
    alignItems: 'center',
  },
  valueSection: {
    alignItems: 'flex-end',
    minWidth: 80,
    gap: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  change: {
    fontSize: 13,
    fontWeight: '500',
  },
})
