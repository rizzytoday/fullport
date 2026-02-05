import { useState, useMemo } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Image } from 'expo-image'
import Animated, { FadeInDown } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/app-styles'
import { Sparkline } from '@/components/sparkline'
import { TokenHolding } from '@/stores/portfolio-store'

const isWeb = Platform.OS === 'web'

type TimePeriod = '1H' | '24H' | '7D' | '30D'

const TIME_PERIODS: { key: TimePeriod; label: string }[] = [
  { key: '1H', label: '1H' },
  { key: '24H', label: '24H' },
  { key: '7D', label: '7D' },
  { key: '30D', label: '30D' },
]

// Generate price history for different time periods
function generatePriceHistoryForPeriod(
  currentPrice: number,
  baseChange: number,
  period: TimePeriod
): { data: number[]; change: number } {
  const points = 24
  const history: number[] = []

  // Different volatility and change patterns per period
  const config: Record<TimePeriod, { volatility: number; changeMultiplier: number; waveFreq: number }> = {
    '1H': { volatility: 0.005, changeMultiplier: 0.1, waveFreq: 8 },
    '24H': { volatility: 0.015, changeMultiplier: 1, waveFreq: 3 },
    '7D': { volatility: 0.03, changeMultiplier: 2.5, waveFreq: 2 },
    '30D': { volatility: 0.05, changeMultiplier: 5, waveFreq: 1.5 },
  }

  const { volatility, changeMultiplier, waveFreq } = config[period]
  const periodChange = baseChange * changeMultiplier
  const startPrice = currentPrice / (1 + periodChange / 100)

  // Use deterministic "random" based on period for consistent charts
  const seed = period.charCodeAt(0)

  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1)
    // Deterministic noise
    const noise = (Math.sin(seed * i * 0.7) * 0.5) * volatility * currentPrice
    const basePrice = startPrice + (currentPrice - startPrice) * progress
    const wave = Math.sin(progress * Math.PI * waveFreq) * currentPrice * volatility
    history.push(Math.max(0, basePrice + noise + wave))
  }

  // Ensure last point matches current price
  history[points - 1] = currentPrice
  return { data: history, change: periodChange }
}

interface TokenDetailProps {
  token: TokenHolding
}

function formatPrice(price: number | null): string {
  if (price === null) return '--'
  if (price < 0.0001) return `$${price.toExponential(2)}`
  if (price < 0.01) return `$${price.toFixed(6)}`
  if (price < 1) return `$${price.toFixed(4)}`
  if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  return `$${price.toFixed(2)}`
}

function formatValue(value: number | null): string {
  if (value === null) return '--'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(2)}K`
  if (amount < 1) return amount.toFixed(4)
  return amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export function TokenDetail({ token }: TokenDetailProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('24H')

  // Generate price data for selected period
  const { chartData, periodChange } = useMemo(() => {
    if (!token.priceUsd) {
      return { chartData: token.priceHistory || [], periodChange: token.change24h ?? 0 }
    }
    const result = generatePriceHistoryForPeriod(
      token.priceUsd,
      token.change24h ?? 0,
      selectedPeriod
    )
    return { chartData: result.data, periodChange: result.change }
  }, [token.priceUsd, token.change24h, selectedPeriod])

  const isPositive = periodChange >= 0
  const changeColor = isPositive ? colors.accentGreen : colors.accentRed

  const handlePeriodPress = (period: TimePeriod) => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedPeriod(period)
  }

  return (
    <View style={styles.container}>
      {/* Token Identity */}
      <Animated.View entering={FadeInDown.delay(0).duration(400)} style={styles.identity}>
        {token.logoUri ? (
          <Image source={{ uri: token.logoUri }} style={styles.logo} contentFit="cover" />
        ) : (
          <View style={[styles.logo, styles.logoFallback]}>
            <Text style={styles.logoText}>{token.symbol.slice(0, 2)}</Text>
          </View>
        )}
        <Text style={styles.symbol}>{token.symbol}</Text>
        <Text style={styles.name}>{token.name}</Text>
      </Animated.View>

      {/* Price Display */}
      <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.priceSection}>
        <Text style={styles.price}>{formatPrice(token.priceUsd)}</Text>
        <View style={[styles.changeBadge, { backgroundColor: `${changeColor}20` }]}>
          <Text style={[styles.changeText, { color: changeColor }]}>
            {isPositive ? '+' : ''}{periodChange.toFixed(2)}%
          </Text>
          <Text style={[styles.changeLabel, { color: changeColor }]}>{selectedPeriod}</Text>
        </View>
      </Animated.View>

      {/* Chart Card with Time Period Selector */}
      <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.chartCard}>
        {/* Time Period Tabs */}
        <View style={styles.periodTabs}>
          {TIME_PERIODS.map((period) => {
            const isActive = selectedPeriod === period.key
            return (
              <Pressable
                key={period.key}
                style={[styles.periodTab, isActive && styles.periodTabActive]}
                onPress={() => handlePeriodPress(period.key)}
              >
                <Text style={[styles.periodTabText, isActive && styles.periodTabTextActive]}>
                  {period.label}
                </Text>
              </Pressable>
            )
          })}
        </View>

        {/* Chart */}
        {chartData.length > 0 ? (
          <View style={styles.chartWrapper}>
            <Sparkline
              data={chartData}
              width={320}
              height={180}
              strokeWidth={2.5}
              showGradient={true}
              color={changeColor}
              animated={true}
              animationKey={selectedPeriod}
            />
          </View>
        ) : (
          <View style={styles.noChartData}>
            <Text style={styles.noChartText}>No price history available</Text>
          </View>
        )}
      </Animated.View>

      {/* Holdings Card */}
      <Animated.View entering={FadeInDown.delay(240).duration(400)} style={styles.holdingsCard}>
        <Text style={styles.holdingsLabel}>Your Holdings</Text>
        <View style={styles.holdingsRow}>
          <View style={styles.holdingsAmount}>
            <Text style={styles.holdingsValue}>{formatAmount(token.uiAmount)}</Text>
            <Text style={styles.holdingsSymbol}>{token.symbol}</Text>
          </View>
          <Text style={styles.holdingsUsd}>{formatValue(token.valueUsd)}</Text>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
    alignItems: 'center',
    paddingTop: spacing.lg,
  },

  // Identity Section
  identity: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  logoFallback: {
    backgroundColor: colors.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textMuted,
  },
  symbol: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  name: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // Price Section
  priceSection: {
    alignItems: 'center',
    gap: spacing.md,
  },
  price: {
    ...typography.displayLarge,
    color: colors.textPrimary,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
  },
  changeText: {
    ...typography.h3,
    fontWeight: '700',
  },
  changeLabel: {
    ...typography.bodySmall,
    fontWeight: '500',
    opacity: 0.8,
  },

  // Chart Section
  chartCard: {
    width: '100%',
    backgroundColor: colors.glassBg,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
  periodTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  periodTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: 'transparent',
  },
  periodTabActive: {
    backgroundColor: colors.glassBgHover,
  },
  periodTabText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textMuted,
  },
  periodTabTextActive: {
    color: colors.textPrimary,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noChartData: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noChartText: {
    ...typography.body,
    color: colors.textMuted,
  },

  // Holdings Section
  holdingsCard: {
    width: '100%',
    backgroundColor: colors.glassBg,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  holdingsLabel: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  holdingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  holdingsAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  holdingsValue: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  holdingsSymbol: {
    ...typography.body,
    color: colors.textSecondary,
  },
  holdingsUsd: {
    ...typography.h2,
    color: colors.textPrimary,
  },
})
