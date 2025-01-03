package io.adrop

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableArray
import io.adrop.ads.metrics.AdropEventParam
import io.adrop.ads.metrics.AdropMetrics
import org.json.JSONArray
import org.json.JSONObject

class AdropMetricsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    @ReactMethod
    fun setProperty(key: String, value: ReadableArray) {
        if (value.size() == 0) return

        when (value.getType(0)) {
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
            when (val value = it.value) {
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

    @ReactMethod
    fun properties(promise: Promise) {
        try {
            promise.resolve(AdropMetrics.properties.toWritableMap())
        } catch (e: Exception) {
            promise.resolve(JSONObject().toWritableMap())
        }
    }

    private fun JSONObject.toWritableMap(): WritableMap {
        val writableMap = Arguments.createMap()
        val keys = this.keys()

        while (keys.hasNext()) {
            val key = keys.next()

            when (val value = this[key]) {
                is JSONObject -> writableMap.putMap(key, value.toWritableMap())
                is JSONArray -> writableMap.putArray(key, value.toWritableArray())
                is Boolean -> writableMap.putBoolean(key, value)
                is Int -> writableMap.putInt(key, value)
                is Double -> writableMap.putDouble(key, value)
                is Float -> writableMap.putDouble(key, value.toDouble())
                else -> writableMap.putString(key, value.toString())
            }
        }
        return writableMap
    }

    private fun JSONArray.toWritableArray(): WritableArray {
        val writableArray = Arguments.createArray()
        for (i in 0 until length()) {
            when (val value = this[i]) {
                is JSONObject -> writableArray.pushMap(value.toWritableMap())
                is JSONArray -> writableArray.pushArray(value.toWritableArray())
                is Boolean -> writableArray.pushBoolean(value)
                is Int -> writableArray.pushInt(value)
                is Double -> writableArray.pushDouble(value)
                is Float -> writableArray.pushDouble(value.toDouble())
                else -> writableArray.pushString(value.toString())
            }
        }
        return writableArray
    }

    override fun getName(): String {
        return "AdropMetrics"
    }
}
