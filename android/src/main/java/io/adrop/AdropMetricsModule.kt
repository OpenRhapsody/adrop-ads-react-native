package io.adrop

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import io.adrop.ads.metrics.AdropEventParam
import io.adrop.ads.metrics.AdropMetrics

class AdropMetricsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    @ReactMethod
    fun setProperty(key: String, value: String) {
        AdropMetrics.setProperty(key, value)
    }

    @ReactMethod
    fun logEvent(name: String, params: ReadableMap? = null) {
        val builder = AdropEventParam.Builder()
        params?.entryIterator?.forEach {
            val dataKey = it.key
            when(val value = it.value) {
                is String -> builder.putString(dataKey, value)
                is Int -> builder.putInt(dataKey, value)
                is Float -> builder.putFloat(dataKey, value)
                is Double -> builder.putFloat(dataKey, value.toFloat())
                is Boolean -> builder.putBoolean(dataKey, value)
                else -> {}
            }
        }
        AdropMetrics.logEvent(name, builder.build())
    }

    override fun getName(): String {
        return "AdropMetrics"
    }
}
