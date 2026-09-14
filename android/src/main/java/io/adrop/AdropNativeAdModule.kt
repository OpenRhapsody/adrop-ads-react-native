package io.adrop

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.modules.core.RCTNativeAppEventEmitter
import io.adrop.ads.model.AdropErrorCode
import io.adrop.ads.nativeAd.AdropAdChoicesPosition
import io.adrop.ads.nativeAd.AdropNativeAd
import io.adrop.ads.model.AdropAdValue
import io.adrop.ads.model.AdropPaidEventListener
import io.adrop.ads.nativeAd.AdropNativeAdListener
import io.adrop.bridge.AdropChannel
import io.adrop.bridge.toWritableMap
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
    fun create(unitId: String, requestId: String, useCustomClick: Boolean = false, preferredAdChoicesPosition: Int = AdropAdChoicesPosition.TOP_RIGHT.value) {
        AdropNativeAdManager.create(reactContext, unitId, requestId, this, useCustomClick, preferredAdChoicesPosition, AdropPaidEventListener(::onNativePaidEvent))
    }

    @ReactMethod
    fun load(unitId: String, requestId: String, useCustomClick: Boolean = false, preferredAdChoicesPosition: Int = AdropAdChoicesPosition.TOP_RIGHT.value) {
        AdropNativeAdManager.load(reactContext, unitId, requestId, this, useCustomClick, preferredAdChoicesPosition, AdropPaidEventListener(::onNativePaidEvent))
    }

    @ReactMethod
    fun destroy(requestId: String) {
        AdropNativeAdManager.destroy(requestId)
    }

    /**
     * Batch load backing `AdropNativeAd.loads()` (JS): one network call, up to
     * 5 pre-loaded ads bound positionally to the JS-minted [requestIds]. A
     * per-call listener handles only the terminal batch callbacks; each ad's
     * listener is then swapped to this module so per-instance events route
     * exactly like the singular path (docs/decisions/batch-loads-api.md §2).
     */
    @ReactMethod
    fun loads(unitId: String, requestIds: ReadableArray, useCustomClick: Boolean, promise: Promise) {
        val ids = (0 until requestIds.size()).mapNotNull { requestIds.getString(it) }

        val batchListener = object : AdropNativeAdListener {
            override fun onAdsReceived(ads: List<AdropNativeAd>) {
                val filled = Arguments.createArray()
                val metas = Arguments.createArray()
                ads.forEachIndexed { index, ad ->
                    if (index >= ids.size) {
                        // Cap-drift guard — destroying inside onAdsReceived is
                        // forbidden (AdropNativeAdListener KDoc), so post it.
                        AdropNativeAdManager.handler.post { ad.destroy() }
                        return@forEachIndexed
                    }
                    val requestId = ids[index]
                    ad.useCustomClick = useCustomClick
                    ad.listener = this@AdropNativeAdModule
                    AdropNativeAdManager.registerPreloaded(requestId, ad)
                    filled.pushString(requestId)
                    metas.pushMap(payloadOf(ad, requestId))
                }
                val response = Arguments.createMap()
                response.putArray("requestIds", filled)
                response.putArray("ads", metas)
                promise.resolve(response)
            }

            override fun onAdsFailedToReceive(errorCode: AdropErrorCode) {
                promise.reject(errorCode.name, "AdropNativeAd.loads failed")
            }

            // Singular callbacks can only fire between auto-attach and the swap
            // above — nothing is mounted yet, so they are intentionally dropped.
            override fun onAdReceived(ad: AdropNativeAd) {}
            override fun onAdClicked(ad: AdropNativeAd) {}
            override fun onAdFailedToReceive(ad: AdropNativeAd, errorCode: AdropErrorCode) {}
        }

        // Main-thread entry per the module thread-safety decision.
        AdropNativeAdManager.handler.post {
            AdropNativeAd.loads(reactContext, unitId, null, batchListener)
        }
    }

    /**
     * Dev reload keeps this process-level registry alive while every JS
     * reference dies — sweep batch-loaded ads so reloads don't stack WebViews.
     */
    override fun invalidate() {
        AdropNativeAdManager.destroyAllPreloaded()
        super.invalidate()
    }


    /**
     * Single payload builder for both events and the batch loads() response
     * (SSOT — a field added here reaches both consumers).
     */
    private fun payloadOf(
        ad: AdropNativeAd,
        requestId: String,
        method: String? = null,
        errorCode: String? = null
    ): WritableMap {
        var creative = ad.creative
        val adPlayerCallback = "window.adPlayerVisibilityCallback"
        val isVideoAd = creative?.contains(adPlayerCallback) == true

        if (isVideoAd && creative?.contains("callback(true);$adPlayerCallback") == false) {
            creative = creative.replace(adPlayerCallback, "callback(true);$adPlayerCallback")
        }

        return Arguments.createMap().apply {
            putString("unitId", ad.unitId)
            putString("txId", ad.txId)
            putString("campaignId", ad.campaignId)
            putString("requestId", requestId)
            method?.let { putString("method", it) }
            errorCode?.let { putString("errorCode", it) }
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
            putString("creative", creative)
            putString("creativeId", ad.creativeId)
            putString("profileName", ad.profile.displayName)
            putString("profileLogo", ad.profile.displayLogo)
            putString("extra", ad.extra.toString())
            putString("asset", ad.asset)
            putBoolean("isBackfilled", ad.isBackfilled)
            putBoolean("isVideoAd", isVideoAd)
            putInt("browserTarget", ad.browserTarget)
            putString("creativeType", ad.creativeType)
        }
    }



    private fun sendEvent(
        ad: AdropNativeAd,
        method: String,
        errorCode: String? = null
    ) {
        AdropNativeAdManager.handler.post {
            val requestId = AdropNativeAdManager.requestIdFor(ad)
            if (requestId.isEmpty()) return@post
            reactContext.getJSModule(RCTNativeAppEventEmitter::class.java)
                .emit(
                    AdropChannel.invokeNativeChannel,
                    payloadOf(ad, requestId, method, errorCode)
                )
        }
    }

    override fun onAdReceived(ad: AdropNativeAd) {
        sendEvent(ad, AdropMethod.DID_RECEIVE_AD)
    }

    override fun onAdClicked(ad: AdropNativeAd) {
        sendEvent(ad, AdropMethod.DID_CLICK_AD)
    }

    override fun onAdFailedToReceive(ad: AdropNativeAd, errorCode: AdropErrorCode) {
        sendEvent(ad, AdropMethod.DID_FAIL_TO_RECEIVE_AD, errorCode.name)
    }

    override fun onAdImpression(ad: AdropNativeAd) {
        sendEvent(ad, AdropMethod.DID_IMPRESSION)
    }

    override fun onAdVideoStart(ad: AdropNativeAd) {
        sendEvent(ad, AdropMethod.DID_VIDEO_START)
    }

    override fun onAdVideoEnd(ad: AdropNativeAd) {
        sendEvent(ad, AdropMethod.DID_VIDEO_END)
    }

    @Suppress("unused")
    fun onNativePaidEvent(ad: AdropNativeAd, value: AdropAdValue) {
        AdropNativeAdManager.handler.post {
            val requestId = AdropNativeAdManager.requestIdFor(ad)
            if (requestId.isEmpty()) return@post
            reactContext.getJSModule(RCTNativeAppEventEmitter::class.java)
                .emit(AdropChannel.invokeNativeChannel, Arguments.createMap().apply {
                    putString("unitId", ad.unitId)
                    putString("requestId", requestId)
                    putString("method", AdropMethod.DID_PAID_EVENT)
                    putString("creativeId", ad.creativeId)
                    putString("txId", ad.txId)
                    putString("campaignId", ad.campaignId)
                    putMap("value", value.toWritableMap())
                })
        }
    }

    companion object {
        const val NAME = "AdropNativeAd"
    }
}
