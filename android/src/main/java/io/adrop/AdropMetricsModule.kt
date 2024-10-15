package io.adrop

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import io.adrop.ads.metrics.AdropEventParam
import io.adrop.ads.metrics.AdropMetrics

class AdropMetricsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    @ReactMethod
    fun setProperty(key: String, value: ReadableArray) {
        if (value.size() == 0) return

        when(value.getType(0)) {
            ReadableType.String -> AdropMetrics.setProperty(key, value.getString(0))
            ReadableType.Boolean -> AdropMetrics.setProperty(key, value.getBoolean(0))
            ReadableType.Number -> {
                val numberValue = value.getDouble(0)
                if (numberValue == numberValue.toInt().toDouble()) {
                    AdropMetrics.setProperty(key, numberValue.toInt())
                } else {
                    AdropMetrics.setProperty(key, numberValue)
                }
            }
            else -> {}
        }
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
