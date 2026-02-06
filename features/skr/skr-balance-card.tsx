import { View, Text, StyleSheet, Pressable, Linking } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg'
import { useSkrStore } from '@/stores/skr-store'
import { usePortfolioStore } from '@/stores/portfolio-store'
import { SKR_CONFIG } from '@/constants/app-config'
import { colors, spacing, borderRadius } from '@/constants/app-styles'
import Animated, { FadeIn } from 'react-native-reanimated'

// Mini sparkline component
function MiniSparkline({ data, width = 60, height = 24 }: { data: number[]; width?: number; height?: number }) {
  if (data.length < 2) return null

  const isPositive = data[data.length - 1] >= data[0]
  const color = isPositive ? colors.accentGreen : colors.accentRed

  const paddingY = 2
  const chartHeight = height - paddingY * 2
  const maxVal = Math.max(...data)
  const minVal = Math.min(...data)
  const range = maxVal - minVal || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = paddingY + chartHeight - ((value - minVal) / range) * chartHeight
    return { x, y }
  })

  const pathData = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`
      const prev = points[index - 1]
      const cpX = (prev.x + point.x) / 2
      return `Q ${cpX} ${prev.y} ${point.x} ${point.y}`
    })
    .join(' ')

  const fillPath = `${pathData} L ${points[points.length - 1].x} ${height} L 0 ${height} Z`

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.3" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={fillPath} fill="url(#miniGradient)" />
      <Path d={pathData} stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </Svg>
  )
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M`
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(2)}K`
  }
  return amount.toFixed(2)
}

function formatUsd(value: number | null): string {
  if (value === null) return '--'
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`
  }
  return `$${value.toFixed(2)}`
}

export function SkrBalanceCard() {
  const { uiBalance, priceUsd, valueUsd, staking, isLoading } = useSkrStore()
  const { holdings } = usePortfolioStore()

  const totalSkr = uiBalance + (staking?.stakedUiAmount ?? 0)
  const totalValue = valueUsd
    ? valueUsd + (staking?.stakedUiAmount ?? 0) * (priceUsd ?? 0)
    : null

  // Get SKR price history and 24h change from portfolio holdings
  const skrHolding = holdings.find(h => h.mint === SKR_CONFIG.mint)
  const change24h = skrHolding?.change24h ?? 12.5 // Default to mock value
  const priceHistory = skrHolding?.priceHistory ?? []
  const isPositive = change24h >= 0

  // Header shows just portfolio holding value (not staked) to match assets view
  const headerValue = skrHolding?.valueUsd ?? valueUsd

  const handleLearnMore = () => {
    Linking.openURL('https://solanamobile.com/skr')
  }

  // Show zero state with CTA
  if (totalSkr === 0 && !isLoading) {
    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            source={{ uri: SKR_CONFIG.logoUri }}
            style={styles.logo}
            contentFit="cover"
          />
          <View style={styles.headerText}>
            <Text style={styles.symbol}>SKR</Text>
            <Text style={styles.price}>@ ${priceUsd?.toFixed(4) ?? '--'}</Text>
          </View>
        </View>

        {/* Zero State */}
        <View style={styles.zeroState}>
          <Ionicons name="sparkles" size={32} color={colors.accentPurple} />
          <Text style={styles.zeroTitle}>No SKR Yet</Text>
          <Text style={styles.zeroDescription}>
            SKR is the Solana Mobile token. Stake it with Guardians to earn rewards.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.learnButton, pressed && styles.learnButtonPressed]}
            onPress={handleLearnMore}
          >
            <Text style={styles.learnButtonText}>Learn More</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.accentPurple} />
          </Pressable>
        </View>
      </Animated.View>
    )
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      {/* Header with Logo, Sparkline, Value, Change */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: SKR_CONFIG.logoUri }}
            style={styles.logo}
            contentFit="cover"
          />
          <View style={styles.headerText}>
            <Text style={styles.symbol}>SKR</Text>
            <Text style={styles.price}>@ ${priceUsd?.toFixed(4) ?? '--'}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {priceHistory.length > 1 && (
            <MiniSparkline data={priceHistory} width={60} height={24} />
          )}
          <View style={styles.headerStats}>
            <Text style={styles.headerValue}>{formatUsd(headerValue)}</Text>
            <Text style={[styles.headerChange, { color: isPositive ? colors.accentGreen : colors.accentRed }]}>
              {isPositive ? '+' : ''}{change24h.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Main Balance */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceValue}>{formatAmount(totalSkr)}</Text>
        <Text style={styles.balanceUsd}>{formatUsd(totalValue)}</Text>
      </View>

      {/* Thin Separator */}
      <View style={styles.separator} />

      {/* Balance Breakdown */}
      <View style={styles.breakdown}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Available</Text>
          <Text style={styles.breakdownValue}>{formatAmount(uiBalance)}</Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Staked</Text>
          <Text style={styles.breakdownValue}>
            {formatAmount(staking?.stakedUiAmount ?? 0)}
          </Text>
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerStats: {
    alignItems: 'flex-end',
    gap: 1,
  },
  headerValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerChange: {
    fontSize: 13,
    fontWeight: '600',
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glassBg,
  },
  headerText: {
    gap: 2,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  price: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textMuted,
  },
  balanceSection: {
    gap: spacing.xs,
  },
  balanceValue: {
    fontSize: 44,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  balanceUsd: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.glassBorder,
  },
  breakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    gap: 2,
  },
  breakdownLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  rewardsValue: {
    color: colors.accentGreen,
  },
  // Zero state styles
  zeroState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  zeroTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  zeroDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
  learnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  learnButtonPressed: {
    opacity: 0.6,
  },
  learnButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accentPurple,
  },
})
