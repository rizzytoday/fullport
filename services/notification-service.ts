import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { PriceAlert } from '@/stores/price-alerts-store'

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

function formatPrice(price: number): string {
  if (price < 0.0001) return `$${price.toExponential(2)}`
  if (price < 0.01) return `$${price.toFixed(6)}`
  if (price < 1) return `$${price.toFixed(4)}`
  return `$${price.toFixed(2)}`
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
