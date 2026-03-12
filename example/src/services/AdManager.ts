import { AdropInterstitialAd, AdropPopupAd } from 'adrop-ads-react-native'
import { AdropUnitId } from '../constants/AdropUnitId'

class AdManagerSingleton {
    private static instance: AdManagerSingleton
    private startupPopup: AdropPopupAd | null = null
    private exitInterstitial: AdropInterstitialAd | null = null

    static getInstance(): AdManagerSingleton {
        if (!AdManagerSingleton.instance) {
            AdManagerSingleton.instance = new AdManagerSingleton()
        }
        return AdManagerSingleton.instance
    }

    preloadStartupPopup() {
        this.startupPopup = new AdropPopupAd(AdropUnitId.POPUP_CENTER)
        this.startupPopup.listener = {
            onAdReceived: () => console.log('[AdManager] Startup popup ready'),
            onAdFailedToReceive: (_ad, err) =>
                console.log('[AdManager] Startup popup failed:', err),
        }
        this.startupPopup.load()
    }

    showStartupPopup() {
        if (this.startupPopup?.isLoaded) {
            this.startupPopup.show()
        }
    }

    preloadExitInterstitial() {
        this.exitInterstitial = new AdropInterstitialAd(
            AdropUnitId.INTERSTITIAL
        )
        this.exitInterstitial.listener = {
            onAdReceived: () =>
                console.log('[AdManager] Exit interstitial ready'),
            onAdFailedToReceive: (_ad, err) =>
                console.log('[AdManager] Exit interstitial failed:', err),
        }
        this.exitInterstitial.load()
    }

    showExitInterstitial(onDismissed: () => void) {
        if (this.exitInterstitial?.isLoaded) {
            this.exitInterstitial.listener = {
                onAdDidDismissFullScreen: () => onDismissed(),
                onAdFailedToShowFullScreen: () => onDismissed(),
            }
            this.exitInterstitial.show()
        } else {
            onDismissed()
        }
    }

    destroyAll() {
        this.startupPopup?.destroy()
        this.startupPopup = null
        this.exitInterstitial?.destroy()
        this.exitInterstitial = null
    }
}

export default AdManagerSingleton.getInstance()
