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
import io.adrop.ads.nativeAd.AdropNativeAd
import io.adrop.ads.nativeAd.AdropNativeAdListener
import io.adrop.bridge.AdropChannel
import io.adrop.bridge.AdropMethod
import java.io.BufferedInputStream
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject

object AdropNativeAdManager {

    val handler = Handler(Looper.getMainLooper())
    private val _nativeAds = mutableMapOf<String, AdropNativeAd>()

    fun create(context: Context, unitId: String, requestId: String, listener: AdropNativeAdListener) {
        _nativeAds[requestId] ?: let {
            handler.post {
                val nativeAd = AdropNativeAd(context, unitId)
                nativeAd.listener = listener
                _nativeAds[requestId] = nativeAd
            }
        }
    }

    fun load(requestId: String) {
        handler.post {
            _nativeAds[requestId]?.load()
        }
    }

    fun destroy(requestId: String) {
        _nativeAds.remove(requestId)?.let {
            handler.post {
                it.destroy()
            }
        }
    }

    fun requestIdFor(ad: AdropNativeAd): String {
        _nativeAds.entries.find { it.value == ad }?.let { return it.key }
        return ""
    }

    fun getAd(requestId: String): AdropNativeAd? {
        return _nativeAds[requestId]
    }
}
