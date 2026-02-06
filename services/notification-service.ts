import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { PriceAlert } from '@/stores/price-alerts-store'
import { StakingInfo } from '@/stores/skr-store'
import { Transaction } from '@/constants/mock-data'
import { SKR_CONFIG } from '@/constants/app-config'

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false

  const { status: existingStatus } = await Notifications.getPermissionsAsync()

  if (existingStatus === 'granted') return true

  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function getNotificationPermissionStatus(): Promise<string> {
  if (Platform.OS === 'web') return 'unavailable'

  const { status } = await Notifications.getPermissionsAsync()
  return status
}

export async function sendPriceAlertNotification(
  alert: PriceAlert,
  currentPrice: number
): Promise<void> {
  if (Platform.OS === 'web') return

  const direction = alert.direction === 'above' ? 'above' : 'below'
  const priceFormatted = formatPrice(currentPrice)
  const targetFormatted = formatPrice(alert.targetPrice)

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${alert.symbol} Price Alert`,
      body: `${alert.symbol} is now ${priceFormatted}, ${direction} your target of ${targetFormatted}`,
      data: {
        alertId: alert.id,
        mint: alert.mint,
        type: 'price_alert',
      },
      sound: true,
      badge: 1,
    },
    trigger: null, // Send immediately
  })
}

export async function sendTestNotification(): Promise<void> {
  if (Platform.OS === 'web') return

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Fullport',
      body: 'Price alerts are enabled! You\'ll be notified when tokens hit your targets.',
      sound: true,
    },
    trigger: null,
  })
}

// Staking reward notification
export async function sendStakingRewardNotification(
  pendingRewards: number,
  rewardsUsd: number
): Promise<void> {
  if (Platform.OS === 'web') return

  const rewardsFormatted = formatAmount(pendingRewards)
  const usdFormatted = formatPrice(rewardsUsd)

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'SKR Rewards Ready',
      body: `You have ${rewardsFormatted} SKR (${usdFormatted}) in pending rewards. Tap to claim!`,
      data: {
        type: 'staking_reward',
        amount: pendingRewards,
      },
      sound: true,
      badge: 1,
    },
    trigger: null,
  })
}

// Airdrop detection notification
export async function sendAirdropNotification(
  tokenSymbol: string,
  amount: number,
  valueUsd?: number
): Promise<void> {
  if (Platform.OS === 'web') return

  const amountFormatted = formatAmount(amount)
  const usdPart = valueUsd ? ` (~${formatPrice(valueUsd)})` : ''

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'New Airdrop Received!',
      body: `You received ${amountFormatted} ${tokenSymbol}${usdPart}`,
      data: {
        type: 'airdrop',
        symbol: tokenSymbol,
        amount,
      },
      sound: true,
      badge: 1,
    },
    trigger: null,
  })
}

// Cooldown complete notification (for unstaking)
export async function sendCooldownCompleteNotification(
  amount: number
): Promise<void> {
  if (Platform.OS === 'web') return

  const amountFormatted = formatAmount(amount)

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Unstaking Complete',
      body: `Your ${amountFormatted} SKR is now available to withdraw.`,
      data: {
        type: 'cooldown_complete',
        amount,
      },
      sound: true,
      badge: 1,
    },
    trigger: null,
  })
}

function formatPrice(price: number): string {
  if (price < 0.0001) return `$${price.toExponential(2)}`
  if (price < 0.01) return `$${price.toFixed(6)}`
  if (price < 1) return `$${price.toFixed(4)}`
  return `$${price.toFixed(2)}`
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(2)}K`
  return amount.toFixed(2)
}

// Check alerts against current prices and trigger notifications
export async function checkPriceAlerts(
  alerts: PriceAlert[],
  getCurrentPrice: (mint: string) => number | null,
  markTriggered: (id: string) => void
): Promise<void> {
  for (const alert of alerts) {
    if (alert.triggered) continue

    const currentPrice = getCurrentPrice(alert.mint)
    if (currentPrice === null) continue

    const shouldTrigger =
      (alert.direction === 'above' && currentPrice >= alert.targetPrice) ||
      (alert.direction === 'below' && currentPrice <= alert.targetPrice)

    if (shouldTrigger) {
      await sendPriceAlertNotification(alert, currentPrice)
      markTriggered(alert.id)
    }
  }
}

// Check staking rewards and notify if above threshold
export async function checkStakingRewards(
  stakingInfo: StakingInfo | null,
  skrPrice: number | null,
  lastNotifiedRewards: number,
  onNotified: (amount: number) => void
): Promise<void> {
  if (!stakingInfo || !skrPrice) return

  const pendingRewards = stakingInfo.pendingRewards / Math.pow(10, SKR_CONFIG.decimals)
  const rewardsUsd = pendingRewards * skrPrice

  // Notify if rewards are above $1 and more than last notified
  const REWARD_THRESHOLD_USD = 1.0
  if (rewardsUsd >= REWARD_THRESHOLD_USD && pendingRewards > lastNotifiedRewards) {
    await sendStakingRewardNotification(pendingRewards, rewardsUsd)
    onNotified(pendingRewards)
  }
}

// Check for new airdrops in transaction list
export async function checkForNewAirdrops(
  transactions: Transaction[],
  notifiedAirdrops: Set<string>,
  onNotified: (signature: string) => void
): Promise<void> {
  for (const tx of transactions) {
    if (tx.type !== 'airdrop') continue
    if (notifiedAirdrops.has(tx.signature)) continue

    const symbol = tx.token?.symbol || 'Unknown'
    const amount = tx.token?.amount || 0
    const valueUsd = tx.valueUsd

    await sendAirdropNotification(symbol, amount, valueUsd)
    onNotified(tx.signature)
  }
}

// Schedule cooldown reminder notification
export async function scheduleCooldownReminder(
  cooldownEnd: number,
  amount: number
): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined

  const now = Date.now()
  const cooldownEndMs = cooldownEnd * 1000

  if (cooldownEndMs <= now) {
    // Already complete, notify immediately
    await sendCooldownCompleteNotification(amount)
    return undefined
  }

  // Schedule for when cooldown ends
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Unstaking Complete',
      body: `Your ${formatAmount(amount)} SKR is now available to withdraw.`,
      data: {
        type: 'cooldown_complete',
        amount,
      },
      sound: true,
      badge: 1,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: cooldownEndMs,
    },
  })

  return identifier
}

// Cancel a scheduled notification
export async function cancelScheduledNotification(identifier: string): Promise<void> {
  if (Platform.OS === 'web') return
  await Notifications.cancelScheduledNotificationAsync(identifier)
}
