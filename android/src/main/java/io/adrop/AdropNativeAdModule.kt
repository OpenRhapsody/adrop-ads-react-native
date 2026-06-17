package io.adrop

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.RCTNativeAppEventEmitter
import io.adrop.ads.model.AdropErrorCode
import io.adrop.ads.nativeAd.AdropNativeAd
import io.adrop.ads.nativeAd.AdropNativeAdListener
import io.adrop.bridge.AdropChannel
import io.adrop.bridge.AdropMethod
import org.json.JSONObject
import io.adrop.native.AdropNativeAdManager


class AdropNativeAdModule(private val reactContext: ReactApplicationContext) :
    AdropNativeAdModuleSpec(reactContext), AdropNativeAdListener {

    override fun getName(): String = NAME

    // ⚠️ BUILD-VERIFY: `preferredAdChoicesPosition` is `Double` to match codegen;
    // converted with `.toInt()` for the core SDK manager. Overrides cannot carry
    // Kotlin default values, so the JS layer must pass all four arguments.
    @ReactMethod
    override fun create(unitId: String, requestId: String, useCustomClick: Boolean, preferredAdChoicesPosition: Double) {
        AdropNativeAdManager.create(reactContext, unitId, requestId, this, useCustomClick, preferredAdChoicesPosition.toInt())
    }

    @ReactMethod
    override fun load(unitId: String, requestId: String, useCustomClick: Boolean, preferredAdChoicesPosition: Double) {
        AdropNativeAdManager.load(reactContext, unitId, requestId, this, useCustomClick, preferredAdChoicesPosition.toInt())
    }

    @ReactMethod
    override fun destroy(requestId: String) {
        AdropNativeAdManager.destroy(requestId)
    }

    @ReactMethod
    override fun addListener(eventName: String) {}

    @ReactMethod
    override fun removeListeners(count: Double) {}


    private fun sendEvent(
        ad: AdropNativeAd,
        method: String,
        errorCode: String? = null
    ) {
        var creative = ad.creative
        val adPlayerCallback = "window.adPlayerVisibilityCallback"
        val isVideoAd = creative?.contains(adPlayerCallback) == true

        if (isVideoAd && !creative.contains("callback(true);$adPlayerCallback")) {
            creative = creative.replace(adPlayerCallback, "callback(true);$adPlayerCallback")
        }

        AdropNativeAdManager.handler.post {
            val requestId = AdropNativeAdManager.requestIdFor(ad)
            if (requestId.isEmpty()) return@post
            reactContext.getJSModule(RCTNativeAppEventEmitter::class.java)
                .emit(AdropChannel.invokeNativeChannel, Arguments.createMap().apply {
                    putString("unitId", ad.unitId)
                    putString("txId", ad.txId)
                    putString("campaignId", ad.campaignId)
                    putString("requestId", requestId)
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
                })
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

    companion object {
        const val NAME = "AdropNativeAd"
    }
}
