package io.adrop

import android.os.Handler
import android.os.Looper
import android.util.Log
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
import io.adrop.native.AdropNativeAdManager


class AdropNativeAdModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), AdropNativeAdListener {

    override fun getName(): String = NAME

    @ReactMethod
    fun create(unitId: String, requestId: String) {
        AdropNativeAdManager.create(reactContext, unitId, requestId, this)
    }

    @ReactMethod
    fun load(requestId: String) {
        AdropNativeAdManager.load(requestId)
    }

    @ReactMethod
    fun destroy(requestId: String) {
        AdropNativeAdManager.destroy(requestId)
    }


    private fun sendEvent(
        ad: AdropNativeAd,
        requestId: String,
        method: String,
        errorCode: String? = null
    ) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(AdropChannel.invokeNativeChannelOf(requestId), Arguments.createMap().apply {
                putString("unitId", ad.unitId)
                putString("method", method)
                putString("errorCode", errorCode)
                putString("icon", ad.icon)
                putString("cover", ad.cover)
                putString("headline", ad.headline)
                putString("body", ad.body)
                putString("destinationURL", ad.destinationURL)
                putString("advertiserURL", ad.advertiserURL)
                putString("accountTag", ad.accountTag.toString())
                putString("creativeTag", ad.creativeTag.toString())
                putString("advertiser", ad.advertiser)
                putString("callToAction", ad.callToAction)
                putString("creative", ad.creative)
                putString("creativeId", ad.creativeId)
                putString("profileName", ad.profile.displayName)
                putString("profileLogo", ad.profile.displayLogo)
                putString("extra", ad.extra.toString())
                putString("asset", ad.asset)
            })
    }

    override fun onAdReceived(ad: AdropNativeAd) {
        sendEvent(ad, AdropNativeAdManager.requestIdFor(ad), AdropMethod.DID_RECEIVE_AD)
    }

    override fun onAdClick(ad: AdropNativeAd) {
        sendEvent(ad, AdropNativeAdManager.requestIdFor(ad), AdropMethod.DID_CLICK_AD)
    }

    override fun onAdFailedToReceive(ad: AdropNativeAd, errorCode: AdropErrorCode) {
        sendEvent(ad, AdropNativeAdManager.requestIdFor(ad), AdropMethod.DID_FAIL_TO_RECEIVE_AD, errorCode.name)
    }

    companion object {
        const val NAME = "AdropNativeAd"
    }
}
