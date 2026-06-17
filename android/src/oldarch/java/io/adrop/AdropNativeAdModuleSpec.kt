package io.adrop

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

/**
 * Old Architecture base mirroring codegen `NativeAdropNativeAdSpec`.
 * `preferredAdChoicesPosition` is `Double` to match codegen number mapping;
 * the concrete module converts with `.toInt()`.
 */
abstract class AdropNativeAdModuleSpec(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {
    abstract fun create(unitId: String, requestId: String, useCustomClick: Boolean, preferredAdChoicesPosition: Double)
    abstract fun load(unitId: String, requestId: String, useCustomClick: Boolean, preferredAdChoicesPosition: Double)
    abstract fun destroy(requestId: String)
    abstract fun addListener(eventName: String)
    abstract fun removeListeners(count: Double)
}
