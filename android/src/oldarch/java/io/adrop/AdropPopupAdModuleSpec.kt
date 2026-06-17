package io.adrop

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReadableMap

/** Old Architecture base mirroring codegen `NativeAdropPopupAdSpec`. */
abstract class AdropPopupAdModuleSpec(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {
    abstract fun create(unitId: String, requestId: String)
    abstract fun load(unitId: String, requestId: String)
    abstract fun show(unitId: String, requestId: String)
    abstract fun customize(requestId: String, data: ReadableMap?)
    abstract fun setUseCustomClick(requestId: String, useCustomClick: Boolean)
    abstract fun close(requestId: String)
    abstract fun destroy(requestId: String)
    abstract fun addListener(eventName: String)
    abstract fun removeListeners(count: Double)
}
