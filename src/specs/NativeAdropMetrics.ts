import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'
import type { Double } from 'react-native/Libraries/Types/CodegenTypes'

/**
 * TurboModule spec for the metrics module (New Architecture).
 *
 * Mirrors the public `AdropMetrics` API (see `src/metrics/AdropMetrics.ts`).
 * `setProperty` receives the value wrapped in a single-element array (the JS
 * layer sends `[value]`); `value` elements may be string/number/boolean, hence
 * `Array<Object>`. `params` is an untyped key/value map.
 *
 * Not imported by the public API yet — see `NativeAdropAds.ts` for rationale.
 */
export interface Spec extends TurboModule {
    setProperty(key: string, value: Array<Object>): void
    sendEvent(name: string, params?: Object): void
    logEvent(name: string, params?: Object): void
    properties(): Promise<Object>
    // Required by NativeEventEmitter (the native module extends RCTEventEmitter)
    addListener(eventName: string): void
    removeListeners(count: Double): void
}

export default TurboModuleRegistry.getEnforcing<Spec>('AdropMetrics')
