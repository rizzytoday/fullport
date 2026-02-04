import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native'
import { appStyles, colors, spacing, borderRadius, typography } from '@/constants/app-styles'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useState, useMemo } from 'react'
import * as Haptics from 'expo-haptics'

// TODO: Use real staking parameters
const STAKING_PARAMS = {
  baseApy: 8.2, // %
  currentPrice: 0.42, // USD
}

export function SkrCalculator() {
  const [amount, setAmount] = useState('1000')
  const [duration, setDuration] = useState<30 | 90 | 365>(365)

  const calculations = useMemo(() => {
    const skrAmount = parseFloat(amount) || 0
    const annualRewards = skrAmount * (STAKING_PARAMS.baseApy / 100)
    const dailyRewards = annualRewards / 365
    const projectedRewards = dailyRewards * duration
    const projectedValue = projectedRewards * STAKING_PARAMS.currentPrice

    return {
      dailyRewards: dailyRewards.toFixed(2),
      projectedRewards: projectedRewards.toFixed(2),
      projectedValue: projectedValue.toFixed(2),
    }
  }, [amount, duration])

  const handleDurationSelect = (d: 30 | 90 | 365) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setDuration(d)
  }

  return (
    <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calculator" size={20} color={colors.accentPurple} />
        <Text style={appStyles.h3}>Rewards Calculator</Text>
      </View>

      {/* Amount Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Amount to Stake</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.inputSuffix}>SKR</Text>
        </View>
      </View>

      {/* Duration Selector */}
      <View style={styles.durationContainer}>
        <Text style={styles.inputLabel}>Time Period</Text>
        <View style={styles.durationRow}>
          {([30, 90, 365] as const).map((d) => (
            <Pressable
              key={d}
              style={[
                styles.durationButton,
                duration === d && styles.durationButtonActive,
              ]}
              onPress={() => handleDurationSelect(d)}
            >
              <Text
                style={[
                  styles.durationText,
                  duration === d && styles.durationTextActive,
                ]}
              >
                {d === 365 ? '1 Year' : `${d} Days`}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Results */}
      <View style={styles.resultsContainer}>
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Daily Rewards</Text>
          <Text style={styles.resultValue}>{calculations.dailyRewards} SKR</Text>
        </View>
        <View style={styles.resultDivider} />
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Projected Rewards</Text>
          <Text style={[styles.resultValue, { color: colors.accentGreen }]}>
            +{calculations.projectedRewards} SKR
          </Text>
        </View>
        <View style={styles.resultDivider} />
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Value (at ${STAKING_PARAMS.currentPrice})</Text>
          <Text style={styles.resultValue}>${calculations.projectedValue}</Text>
        </View>
      </View>

      <Text style={styles.disclaimer}>
        * Estimates based on {STAKING_PARAMS.baseApy}% APY. Actual rewards may vary.
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glassBg,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputContainer: {
    gap: spacing.sm,
  },
  inputLabel: {
    ...typography.label,
    color: colors.textMuted,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.h2,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  inputSuffix: {
    ...typography.body,
    fontWeight: '600',
    color: colors.accentPurple,
  },
  durationContainer: {
    gap: spacing.sm,
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  durationButton: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  durationButtonActive: {
    borderColor: colors.accentPurple,
    backgroundColor: colors.accentPurple + '15',
  },
  durationText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  durationTextActive: {
    color: colors.accentPurple,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  resultLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  resultValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  resultDivider: {
    height: 1,
    backgroundColor: colors.glassBorder,
  },
  disclaimer: {
    ...typography.labelSmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
})
