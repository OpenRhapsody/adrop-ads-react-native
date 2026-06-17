package io.adrop

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReadableArray

/**
 * Old Architecture base: classic bridge module. Abstract signatures mirror the
 * codegen `NativeAdropAdsSpec` so the concrete [AdropAdsModule] uses one
 * `override` set across both architectures. `@ReactMethod` lives on the concrete
 * overrides. `viewTag` is `Double` to match codegen number mapping.
 */
abstract class AdropAdsModuleSpec(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {
    abstract fun initialize(production: Boolean, targetCountries: ReadableArray, useInAppBrowser: Boolean)
    abstract fun setUID(uid: String)
    abstract fun setTheme(theme: String)
    abstract fun setMarketingConsent(consent: Boolean)
    abstract fun registerWebView(viewTag: Double, promise: Promise)
}
