package io.adrop

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.RCTNativeAppEventEmitter
import io.adrop.ads.interstitial.AdropInterstitialAd
import io.adrop.ads.interstitial.AdropInterstitialAdCloseListener
import io.adrop.ads.interstitial.AdropInterstitialAdListener
import io.adrop.ads.model.AdropErrorCode
import io.adrop.bridge.AdropChannel
import io.adrop.bridge.AdropMethod
import java.util.concurrent.ConcurrentHashMap

class AdropInterstitialAdModule(reactContext: ReactApplicationContext) :
    AdropInterstitialAdModuleSpec(reactContext), AdropInterstitialAdListener, AdropInterstitialAdCloseListener {
    private val handler = Handler(Looper.getMainLooper())
    private val _interstitialAds = ConcurrentHashMap<String, AdropInterstitialAd>()

    override fun getName(): String = NAME

    @ReactMethod
    override fun create(unitId: String, requestId: String) {
        handler.post {
            _interstitialAds[requestId] ?: let {
                val interstitialAd = AdropInterstitialAd(reactApplicationContext, unitId)
                interstitialAd.interstitialAdListener = this
                interstitialAd.closeListener = this
                _interstitialAds[requestId] = interstitialAd
            }
        }
    }

    @ReactMethod
    override fun load(unitId: String, requestId: String) {
        handler.post {
            _interstitialAds[requestId]?.load()
        }
    }

    @ReactMethod
    override fun show(unitId: String, requestId: String) {
        handler.post {
            _interstitialAds[requestId]?.let { ad ->
                reactApplicationContext.currentActivity?.let { fromActivity ->
                    ad.show(fromActivity)
                }
            }
                ?: reactApplicationContext.getJSModule(RCTNativeAppEventEmitter::class.java)
                    .emit(AdropChannel.invokeInterstitialChannel(requestId), Arguments.createMap().apply {
                        putString("unitId", unitId)
                        putString("method", AdropMethod.DID_FAIL_TO_SHOW_FULL_SCREEN)
                        putString("errorCode", AdropErrorCode.ERROR_CODE_AD_EMPTY.name)
                    })
        }
    }

    @ReactMethod
    fun customize(requestId: String, data: ReadableMap? = null) {}

    @ReactMethod
    fun close(requestId: String) {
        handler.post {
            _interstitialAds[requestId]?.close()
        }
    }

    @ReactMethod
    override fun destroy(requestId: String) {
        handler.post {
            _interstitialAds.remove(requestId)?.destroy()
        }
    }

    // Required by NativeEventEmitter (JS) / codegen spec. The actual emission
    // uses the global RCTNativeAppEventEmitter, so these are no-op book-keeping.
    @ReactMethod
    override fun addListener(eventName: String) {}

    @ReactMethod
    override fun removeListeners(count: Double) {}

    private fun requestIdFor(ad: AdropInterstitialAd?): String {
        _interstitialAds.entries.find { it.value == ad }?.let { return it.key }
        return ""
    }

    private fun sendEvent(
        ad: AdropInterstitialAd,
        method: String,
        errorCode: String? = null
    ) {
        handler.post {
            val requestId = requestIdFor(ad)
            if (requestId.isEmpty()) return@post
            reactApplicationContext.getJSModule(RCTNativeAppEventEmitter::class.java)
                .emit(AdropChannel.invokeInterstitialChannel(requestId), Arguments.createMap().apply {
                    putString("unitId", ad.unitId)
                    putString("txId", ad.txId)
                    putString("campaignId", ad.campaignId)
                    putString("method", method)
                    putString("creativeId", ad.creativeId)
                    putString("errorCode", errorCode)
                    putInt("browserTarget", ad.browserTarget)
                })
        }
    }

    override fun onAdFailedToReceive(ad: AdropInterstitialAd, errorCode: AdropErrorCode) {
        sendEvent(ad, AdropMethod.DID_FAIL_TO_RECEIVE_AD, errorCode = errorCode.name)
    }

    override fun onAdReceived(ad: AdropInterstitialAd) {
        sendEvent(ad, AdropMethod.DID_RECEIVE_AD)
    }

    override fun onAdClicked(ad: AdropInterstitialAd) {
        sendEvent(ad, AdropMethod.DID_CLICK_AD)
    }

    override fun onAdImpression(ad: AdropInterstitialAd) {
        sendEvent(ad, AdropMethod.DID_IMPRESSION)
    }

    override fun onAdDidDismissFullScreen(ad: AdropInterstitialAd) {
        sendEvent(ad, AdropMethod.DID_DISMISS_FULL_SCREEN)
    }

    override fun onAdDidPresentFullScreen(ad: AdropInterstitialAd) {
        sendEvent(ad, AdropMethod.DID_PRESENT_FULL_SCREEN)
    }

    override fun onAdFailedToShowFullScreen(ad: AdropInterstitialAd, errorCode: AdropErrorCode) {
        sendEvent(ad, AdropMethod.DID_FAIL_TO_SHOW_FULL_SCREEN, errorCode = errorCode.name)
    }

    override fun onBackPressed(ad: AdropInterstitialAd) {
        sendEvent(ad, AdropMethod.ON_AD_BACK_BUTTON_PRESSED)
    }

    companion object {
        const val NAME = "AdropInterstitialAd"
    }
}
