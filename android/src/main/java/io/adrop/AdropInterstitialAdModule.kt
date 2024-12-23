package io.adrop

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.modules.core.RCTNativeAppEventEmitter
import io.adrop.ads.interstitial.AdropInterstitialAd
import io.adrop.ads.interstitial.AdropInterstitialAdListener
import io.adrop.ads.model.AdropErrorCode
import io.adrop.bridge.AdropChannel
import io.adrop.bridge.AdropMethod

class AdropInterstitialAdModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), AdropInterstitialAdListener {
    private val _interstitialAds = mutableMapOf<String, AdropInterstitialAd>()

    override fun getName(): String = NAME

    @ReactMethod
    fun create(unitId: String, requestId: String) {
        _interstitialAds[requestId] ?: let {
            val interstitialAd = AdropInterstitialAd(reactApplicationContext, unitId)
            interstitialAd.interstitialAdListener = this
            _interstitialAds[requestId] = interstitialAd
        }
    }

    @ReactMethod
    fun load(unitId: String, requestId: String) {
        _interstitialAds[requestId]?.load()
    }

    @ReactMethod
    fun show(unitId: String, requestId: String) {
        _interstitialAds[requestId]?.let {
            currentActivity?.let { fromActivity -> it.show(fromActivity) }
        }
            ?: sendEvent(
                unitId,
                requestId,
                AdropMethod.DID_FAIL_TO_SHOW_FULL_SCREEN,
                AdropErrorCode.ERROR_CODE_AD_EMPTY.name
            )
    }

    @ReactMethod
    fun customize(requestId: String, data: ReadableMap? = null) {}

    @ReactMethod
    fun destroy(requestId: String) {
        _interstitialAds.remove(requestId)?.let {
            it.destroy()
        }
    }

    private fun requestIdFor(ad: AdropInterstitialAd?): String {
        _interstitialAds.entries.find { it.value == ad }?.let { return it.key }
        return ""
    }

    private fun sendEvent(
        unitId: String,
        requestId: String,
        method: String,
        creativeId: String? = null,
        errorCode: String? = null
    ) {
        reactApplicationContext.getJSModule(RCTNativeAppEventEmitter::class.java)
            .emit(AdropChannel.invokeInterstitialChannel(requestId), Arguments.createMap().apply {
                putString("unitId", unitId)
                putString("method", method)
                putString("creativeId", creativeId)
                putString("errorCode", errorCode)
            })
    }

    override fun onAdFailedToReceive(ad: AdropInterstitialAd, errorCode: AdropErrorCode) {
        sendEvent(ad.unitId, requestIdFor(ad), AdropMethod.DID_FAIL_TO_RECEIVE_AD, errorCode = errorCode.name)
    }

    override fun onAdReceived(ad: AdropInterstitialAd) {
        sendEvent(ad.unitId, requestIdFor(ad), AdropMethod.DID_RECEIVE_AD, creativeId = ad.creativeId)
    }

    override fun onAdClicked(ad: AdropInterstitialAd) {
        sendEvent(ad.unitId, requestIdFor(ad), AdropMethod.DID_CLICK_AD)
    }

    override fun onAdImpression(ad: AdropInterstitialAd) {
        sendEvent(ad.unitId, requestIdFor(ad), AdropMethod.DID_IMPRESSION)
    }

    override fun onAdDidDismissFullScreen(ad: AdropInterstitialAd) {
        sendEvent(ad.unitId, requestIdFor(ad), AdropMethod.DID_DISMISS_FULL_SCREEN)
    }

    override fun onAdDidPresentFullScreen(ad: AdropInterstitialAd) {
        sendEvent(ad.unitId, requestIdFor(ad), AdropMethod.DID_PRESENT_FULL_SCREEN)
    }

    override fun onAdFailedToShowFullScreen(ad: AdropInterstitialAd, errorCode: AdropErrorCode) {
        sendEvent(
            ad.unitId,
            requestIdFor(ad),
            AdropMethod.DID_FAIL_TO_SHOW_FULL_SCREEN,
            errorCode = errorCode.name
        )
    }

    companion object {
        const val NAME = "AdropInterstitialAd"
    }
}
