import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes'

/**
 * TurboModule spec for the consent (UMP) module (New Architecture).
 *
 * Mirrors the public `AdropConsent` API (see `src/consent/AdropConsent.ts`).
 * `status` is the numeric `AdropConsentStatus` enum value; `geography` is the
 * numeric `AdropConsentDebugGeography` enum value.
 *
 * Not imported by the public API yet — see `NativeAdropAds.ts` for rationale.
 */
export type AdropConsentResultNative = {
    status: Int32
    canRequestAds: boolean
    canShowPersonalizedAds: boolean
    error?: string
}

export interface Spec extends TurboModule {
    requestConsentInfoUpdate(): Promise<AdropConsentResultNative>
    getConsentStatus(): Promise<Int32>
    canRequestAds(): Promise<boolean>
    reset(): void
    setDebugSettings(geography: Int32): void
}

export default TurboModuleRegistry.getEnforcing<Spec>('AdropConsent')
