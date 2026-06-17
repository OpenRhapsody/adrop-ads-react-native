package io.adrop

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

/** Old Architecture base mirroring codegen `NativeAdropRewardedAdSpec`. */
abstract class AdropRewardedAdModuleSpec(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {
    abstract fun create(unitId: String, requestId: String)
    abstract fun setServerSideVerificationOptions(requestId: String, userId: String, customData: String)
    abstract fun load(unitId: String, requestId: String)
    abstract fun show(unitId: String, requestId: String)
    abstract fun destroy(requestId: String)
    abstract fun addListener(eventName: String)
    abstract fun removeListeners(count: Double)
}
