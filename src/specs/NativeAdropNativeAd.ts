import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'
import type { Double, Int32 } from 'react-native/Libraries/Types/CodegenTypes'

/**
 * TurboModule spec for the native ad data module (New Architecture).
 *
 * Mirrors the public `AdropNativeAd` API (see `src/ads/AdropNativeAd.tsx`).
 * `preferredAdChoicesPosition` is the numeric `AdropAdChoicesPosition` enum
 * value. This module owns the ad *data* lifecycle; the rendering is handled by
 * the `AdropNativeAdView` Fabric component.
 *
 * Not imported by the public API yet — see `NativeAdropAds.ts` for rationale.
 */
export interface Spec extends TurboModule {
    create(
        unitId: string,
        requestId: string,
        useCustomClick: boolean,
        preferredAdChoicesPosition: Int32
    ): void
    load(
        unitId: string,
        requestId: string,
        useCustomClick: boolean,
        preferredAdChoicesPosition: Int32
    ): void
    destroy(requestId: string): void
    addListener(eventName: string): void
    removeListeners(count: Double): void
}

export default TurboModuleRegistry.getEnforcing<Spec>('AdropNativeAd')
