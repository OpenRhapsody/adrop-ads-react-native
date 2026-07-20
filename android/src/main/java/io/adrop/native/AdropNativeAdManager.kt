package io.adrop.native

import android.content.Context
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.adrop.ads.model.AdropErrorCode
import io.adrop.ads.nativeAd.AdropAdChoicesPosition
import io.adrop.ads.nativeAd.AdropNativeAd
import io.adrop.ads.nativeAd.AdropNativeAdListener
import io.adrop.bridge.AdropChannel
import io.adrop.bridge.AdropMethod
import java.io.BufferedInputStream
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.ConcurrentHashMap
import org.json.JSONObject

object AdropNativeAdManager {

    val handler = Handler(Looper.getMainLooper())
    private val _nativeAds = ConcurrentHashMap<String, AdropNativeAd>()

    // The core SDK's AdropAdChoicesPosition.fromValue is stripped by proguard
    // in release AARs (only public methods are kept), so we map values directly
    // inside the wrapper.
    private fun toAdChoicesPosition(value: Int): AdropAdChoicesPosition = when (value) {
        AdropAdChoicesPosition.TOP_LEFT.value -> AdropAdChoicesPosition.TOP_LEFT
        AdropAdChoicesPosition.BOTTOM_LEFT.value -> AdropAdChoicesPosition.BOTTOM_LEFT
        AdropAdChoicesPosition.BOTTOM_RIGHT.value -> AdropAdChoicesPosition.BOTTOM_RIGHT
        else -> AdropAdChoicesPosition.TOP_RIGHT
    }

    fun create(context: Context, unitId: String, requestId: String, listener: AdropNativeAdListener, useCustomClick: Boolean = false, preferredAdChoicesPosition: Int = AdropAdChoicesPosition.TOP_RIGHT.value) {
        handler.post {
            _nativeAds[requestId] ?: let {
                val nativeAd = AdropNativeAd(context, unitId, "")
                nativeAd.useCustomClick = useCustomClick
                nativeAd.preferredAdChoicesPosition = toAdChoicesPosition(preferredAdChoicesPosition)
                nativeAd.listener = listener
                _nativeAds[requestId] = nativeAd
            }
        }
    }

    fun load(context: Context, unitId: String, requestId: String, listener: AdropNativeAdListener, useCustomClick: Boolean = false, preferredAdChoicesPosition: Int = AdropAdChoicesPosition.TOP_RIGHT.value) {
        handler.post {
            if (_nativeAds[requestId] == null) {
                val nativeAd = AdropNativeAd(context, unitId, "")
                nativeAd.useCustomClick = useCustomClick
                nativeAd.preferredAdChoicesPosition = toAdChoicesPosition(preferredAdChoicesPosition)
                nativeAd.listener = listener
                _nativeAds[requestId] = nativeAd
            } else {
                // Update the preferred position on the existing instance if the publisher specified a new one.
                _nativeAds[requestId]?.preferredAdChoicesPosition =
                    toAdChoicesPosition(preferredAdChoicesPosition)
            }
            _nativeAds[requestId]?.load()
        }
    }

    fun destroy(requestId: String) {
        handler.post {
            _nativeAds.remove(requestId)?.destroy()
        }
    }

    fun requestIdFor(ad: AdropNativeAd): String {
        _nativeAds.entries.find { it.value == ad }?.let { return it.key }
        return ""
    }

    fun getAd(requestId: String): AdropNativeAd? {
        return _nativeAds[requestId]
    }

    fun findAdByUnitId(unitId: String): AdropNativeAd? {
        return _nativeAds.values.find { it.unitId == unitId }
    }
}
