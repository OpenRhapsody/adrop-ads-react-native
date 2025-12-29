import type { AdropConsentStatus } from './AdropConsentStatus'

export interface AdropConsentResult {
    /** Consent status */
    status: AdropConsentStatus
    /** Whether ads can be requested (key value) */
    canRequestAds: boolean
    /** Whether personalized ads can be shown */
    canShowPersonalizedAds: boolean
    /** Error (if any) */
    error?: string
}
