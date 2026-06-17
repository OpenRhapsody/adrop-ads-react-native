import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'
import type { Double } from 'react-native/Libraries/Types/CodegenTypes'

/**
 * TurboModule spec for the popup ad module (New Architecture).
 *
 * Mirrors the public `AdropPopupAd` API. `customize` receives an untyped style
 * map (`data`), so it is typed as `Object`.
 *
 * Not imported by the public API yet — see `NativeAdropAds.ts` for rationale.
 */
export interface Spec extends TurboModule {
    create(unitId: string, requestId: string): void
    load(unitId: string, requestId: string): void
    show(unitId: string, requestId: string): void
    customize(requestId: string, data: Object): void
    setUseCustomClick(requestId: string, useCustomClick: boolean): void
    close(requestId: string): void
    destroy(requestId: string): void
    addListener(eventName: string): void
    removeListeners(count: Double): void
}

export default TurboModuleRegistry.getEnforcing<Spec>('AdropPopupAd')
