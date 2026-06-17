package io.adrop

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap

/** Old Architecture base mirroring codegen `NativeAdropMetricsSpec`. */
abstract class AdropMetricsModuleSpec(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {
    abstract fun setProperty(key: String, value: ReadableArray)
    abstract fun sendEvent(name: String, params: ReadableMap?)
    abstract fun logEvent(name: String, params: ReadableMap?)
    abstract fun properties(promise: Promise)
    abstract fun addListener(eventName: String)
    abstract fun removeListeners(count: Double)
}
