import { NativeModules } from 'react-native'
import type { AdropConsentResult } from './AdropConsentResult'
import type { AdropConsentStatus } from './AdropConsentStatus'
import type { AdropConsentDebugGeography } from './AdropConsentDebugGeography'

const { AdropConsent: NativeAdropConsent } = NativeModules

class AdropConsent {
    /**
     * Update consent info and show popup if needed
     * @returns Consent result
     */
    static requestConsentInfoUpdate = (): Promise<AdropConsentResult> => {
        return NativeAdropConsent.requestConsentInfoUpdate()
    }

    /**
     * Get consent status
     * @returns Consent status value
     */
    static getConsentStatus = (): Promise<AdropConsentStatus> => {
        return NativeAdropConsent.getConsentStatus()
    }

    /**
     * Check if ads can be requested
     * @returns Whether ads can be requested
     */
    static canRequestAds = (): Promise<boolean> => {
        return NativeAdropConsent.canRequestAds()
    }

    /**
     * Reset consent settings (for testing/debugging)
     */
    static reset = (): void => {
        NativeAdropConsent.reset()
    }

    /**
     * Set debug settings (only works in DEBUG builds)
     * @param geography Geography to test
     */
    static setDebugSettings = (geography: AdropConsentDebugGeography): void => {
        NativeAdropConsent.setDebugSettings(geography)
    }
}

export default AdropConsent
