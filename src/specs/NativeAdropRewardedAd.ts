import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'
import type { Double } from 'react-native/Libraries/Types/CodegenTypes'

/**
 * TurboModule spec for the rewarded ad module (New Architecture).
 *
 * Mirrors the public `AdropRewardedAd` API. `setServerSideVerificationOptions`
 * forwards SSV user id / custom data to the native SDK.
 *
 * Not imported by the public API yet — see `NativeAdropAds.ts` for rationale.
 */
export interface Spec extends TurboModule {
    create(unitId: string, requestId: string): void
    setServerSideVerificationOptions(
        requestId: string,
        userId: string,
        customData: string
    ): void
    load(unitId: string, requestId: string): void
    show(unitId: string, requestId: string): void
    destroy(requestId: string): void
    addListener(eventName: string): void
    removeListeners(count: Double): void
}

export default TurboModuleRegistry.getEnforcing<Spec>('AdropRewardedAd')
