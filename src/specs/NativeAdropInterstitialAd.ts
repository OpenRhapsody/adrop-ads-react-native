import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'
import type { Double } from 'react-native/Libraries/Types/CodegenTypes'

/**
 * TurboModule spec for the interstitial ad module (New Architecture).
 *
 * Each ad instance is identified by a `requestId` (nanoid). The native module
 * extends RCTEventEmitter and pushes lifecycle events on a per-instance
 * channel, so `addListener`/`removeListeners` are required.
 *
 * Not imported by the public API yet — see `NativeAdropAds.ts` for rationale.
 */
export interface Spec extends TurboModule {
    create(unitId: string, requestId: string): void
    load(unitId: string, requestId: string): void
    show(unitId: string, requestId: string): void
    destroy(requestId: string): void
    addListener(eventName: string): void
    removeListeners(count: Double): void
}

export default TurboModuleRegistry.getEnforcing<Spec>('AdropInterstitialAd')
