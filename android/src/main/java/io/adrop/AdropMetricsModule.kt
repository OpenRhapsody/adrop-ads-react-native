package io.adrop

import android.util.Log
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
    fun sendEvent(name: String, params: ReadableMap? = null) {
        try {
            if (params == null) {
                AdropMetrics.sendEvent(name)
                return
            }
            AdropMetrics.sendEvent(name, toEventParam(params))
        } catch (e: Throwable) {
            val safeName = name.replace(Regex("[\\n\\r\\t\\u0000-\\u001F]"), "")
            Log.e("AdropMetrics", "Failed to send event: $safeName", e)
        }
    }

    private fun toEventParam(map: ReadableMap, depth: Int = 0): AdropEventParam {
        if (depth > 10) return AdropEventParam.Builder().build()
        val builder = AdropEventParam.Builder()
        map.entryIterator.forEach { entry ->
            val key = entry.key
            when (val value = entry.value) {
                is String -> builder.putString(key, value)
                is Boolean -> builder.putBoolean(key, value)
                is Double -> {
                    if (value.isNaN() || value.isInfinite()) return@forEach
                    // JS Number.MAX_SAFE_INTEGER (2^53-1) is within Long range; integer detection is accurate for JS-origin values
                    if (value == value.toLong().toDouble()) {
                        builder.putLong(key, value.toLong())
                    } else {
                        builder.putFloat(key, value.toFloat())
                    }
                }
                is com.facebook.react.bridge.ReadableArray -> {
                    val items = mutableListOf<AdropEventParam>()
                    for (i in 0 until value.size()) {
                        if (value.getType(i) == ReadableType.Map) {
                            value.getMap(i)?.let { items.add(toEventParam(it, depth + 1)) }
                        }
                    }
                    if (items.isNotEmpty()) builder.putItems(items)
                }
                else -> {}
            }
        }
        return builder.build()
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
