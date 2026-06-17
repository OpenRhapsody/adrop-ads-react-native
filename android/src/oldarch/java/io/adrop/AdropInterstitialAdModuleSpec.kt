package io.adrop

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

/**
 * Old Architecture base mirroring codegen `NativeAdropInterstitialAdSpec`.
 * `addListener`/`removeListeners` are required because the JS layer wraps this
 * module in a NativeEventEmitter.
 */
abstract class AdropInterstitialAdModuleSpec(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {
    abstract fun create(unitId: String, requestId: String)
    abstract fun load(unitId: String, requestId: String)
    abstract fun show(unitId: String, requestId: String)
    abstract fun destroy(requestId: String)
    abstract fun addListener(eventName: String)
    abstract fun removeListeners(count: Double)
}
