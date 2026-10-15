import { NativeModules } from 'react-native'
import type { AdropConsentResult } from './AdropConsentResult'
import type { AdropConsentStatus } from './AdropConsentStatus'
import type { AdropConsentDebugGeography } from './AdropConsentDebugGeography'
import type { AdropPrivacyOptionsRequirementStatus } from './AdropPrivacyOptionsRequirementStatus'

const { AdropConsent: NativeAdropConsent } = NativeModules

class AdropConsent {
    /**
     * Update consent info and show popup if needed.
     * Call on every app launch, even when consent was already obtained —
     * getPrivacyOptionsRequirementStatus() reflects this session only after it completes.
     * @returns Consent result
     */
    static requestConsentInfoUpdate = (): Promise<AdropConsentResult> => {
        return NativeAdropConsent.requestConsentInfoUpdate()
    }

    /**
     * Whether a privacy options (privacy settings) entry point must be shown.
     * Meaningful after requestConsentInfoUpdate() completes in this app session.
     * When REQUIRED, show the entry point and call showPrivacyOptionsForm() from it.
     * Resolves UNKNOWN when the consent manager is not available.
     * @returns Privacy options requirement status
     */
    static getPrivacyOptionsRequirementStatus =
        (): Promise<AdropPrivacyOptionsRequirementStatus> => {
            return NativeAdropConsent.getPrivacyOptionsRequirementStatus()
        }

    /**
     * Show the privacy options form so the user can change their consent.
     * The form is shown only when the status is REQUIRED; otherwise consent is
     * left unchanged and the result carries the current state with an error.
     * @returns Consent result after the form closes
     */
    static showPrivacyOptionsForm = (): Promise<AdropConsentResult> => {
        return NativeAdropConsent.showPrivacyOptionsForm()
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
     * Reset consent settings — for testing only, do not call in production code.
     * To let users change their consent, use showPrivacyOptionsForm().
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
