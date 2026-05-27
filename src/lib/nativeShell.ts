import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'

export async function initNativeShell(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  try {
    await StatusBar.setStyle({ style: Style.Light })
  } catch {
    // Status bar plugin unavailable on some devices
  }

  try {
    await SplashScreen.hide()
  } catch {
    // ignore
  }
}
