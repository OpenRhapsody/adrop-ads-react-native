import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes'

/**
 * TurboModule spec for the core Adrop module (New Architecture).
 *
 * This file is consumed by React Native Codegen to generate the native
 * interface used on the New Architecture. It is intentionally NOT imported by
 * the public TypeScript API yet — consumers still resolve the module via
 * `NativeModules.AdropAds`, which keeps the Old Architecture path unchanged.
 * Wiring the public API to `TurboModuleRegistry` happens once the native
 * modules conform to this spec on both platforms.
 *
 * Signatures mirror the public `Adrop` API surface (see `src/Adrop.ts`):
 * `initialize` / `setUID` / `setTheme` / `setMarketingConsent` are
 * fire-and-forget, `registerWebView` resolves a promise.
 */
export interface Spec extends TurboModule {
    initialize(
        production: boolean,
        targetCountries: Array<string>,
        useInAppBrowser: boolean
    ): void
    setUID(uid: string): void
    setTheme(theme: string): void
    setMarketingConsent(consent: boolean): void
    registerWebView(viewTag: Int32): Promise<void>
}

export default TurboModuleRegistry.getEnforcing<Spec>('AdropAds')
