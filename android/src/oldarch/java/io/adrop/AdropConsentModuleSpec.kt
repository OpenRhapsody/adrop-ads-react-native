package io.adrop

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

/**
 * Old Architecture base mirroring codegen `NativeAdropConsentSpec`.
 * `geography` is `Double` to match codegen number mapping; the concrete module
 * converts with `.toInt()`.
 */
abstract class AdropConsentModuleSpec(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {
    abstract fun requestConsentInfoUpdate(promise: Promise)
    abstract fun getConsentStatus(promise: Promise)
    abstract fun canRequestAds(promise: Promise)
    abstract fun reset()
    abstract fun setDebugSettings(geography: Double)
}
