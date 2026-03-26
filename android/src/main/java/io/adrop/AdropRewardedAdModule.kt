package io.adrop

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.modules.core.RCTNativeAppEventEmitter
import io.adrop.ads.model.AdropErrorCode
import io.adrop.ads.rewardedAd.AdropRewardedAd
import io.adrop.ads.rewardedAd.AdropRewardedAdListener
import io.adrop.ads.rewardedAd.ServerSideVerificationOptions
import io.adrop.bridge.AdropChannel
import io.adrop.bridge.AdropMethod
import java.util.concurrent.ConcurrentHashMap

class AdropRewardedAdModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), AdropRewardedAdListener {

    private val handler = Handler(Looper.getMainLooper())
    private val _rewardedAds = ConcurrentHashMap<String, AdropRewardedAd>()

    override fun getName(): String = NAME

    @ReactMethod
    fun create(unitId: String, requestId: String) {
        handler.post {
            _rewardedAds[requestId] ?: let {
                val rewardedAd = AdropRewardedAd(reactApplicationContext, unitId)
                rewardedAd.rewardedAdListener = this
                _rewardedAds[requestId] = rewardedAd
            }
        }
    }

    @ReactMethod
    fun setServerSideVerificationOptions(requestId: String, userId: String?, customData: String?) {
        handler.post {
            _rewardedAds[requestId]?.let { ad ->
                if (userId != null || customData != null) {
                    ad.serverSideVerificationOptions = ServerSideVerificationOptions(userId, customData)
                } else {
                    ad.serverSideVerificationOptions = null
                }
            }
        }
    }

    @ReactMethod
    fun load(unitId: String, requestId: String) {
        handler.post {
            _rewardedAds[requestId]?.load()
        }
    }

    @ReactMethod
    fun show(unitId: String, requestId: String) {
        handler.post {
            _rewardedAds[requestId]?.let { ad ->
                reactApplicationContext.currentActivity?.let { fromActivity ->
                    ad.show(fromActivity) { type, amount ->
                        sendEarnEvent(ad, type, amount)
                    }
                }
            }
                ?: reactApplicationContext.getJSModule(RCTNativeAppEventEmitter::class.java)
                    .emit(AdropChannel.invokeRewardedChannelOf(requestId), Arguments.createMap().apply {
                        putString("unitId", unitId)
                        putString("method", AdropMethod.DID_FAIL_TO_SHOW_FULL_SCREEN)
                        putString("errorCode", AdropErrorCode.ERROR_CODE_AD_EMPTY.name)
                    })
        }
    }

    @ReactMethod
    fun customize(requestId: String, data: ReadableMap? = null) {}

    @ReactMethod
    fun destroy(requestId: String) {
        handler.post {
            _rewardedAds.remove(requestId)?.destroy()
        }
    }

    private fun requestIdFor(ad: AdropRewardedAd?): String {
        _rewardedAds.entries.find { it.value == ad }?.let { return it.key }
        return ""
    }

    private fun sendEvent(
        ad: AdropRewardedAd,
        method: String,
        errorCode: String? = null
    ) {
        handler.post {
            val requestId = requestIdFor(ad)
            if (requestId.isEmpty()) return@post
            reactApplicationContext.getJSModule(RCTNativeAppEventEmitter::class.java)
                .emit(AdropChannel.invokeRewardedChannelOf(requestId), Arguments.createMap().apply {
                    putString("unitId", ad.unitId)
                    putString("method", method)
                    putString("creativeId", ad.creativeId)
                    putString("txId", ad.txId)
                    putString("campaignId", ad.campaignId)
                    putString("errorCode", errorCode)
                    putInt("browserTarget", ad.browserTarget)
                })
        }
    }

    private fun sendEarnEvent(ad: AdropRewardedAd, type: Int, amount: Int) {
        handler.post {
            val requestId = requestIdFor(ad)
            if (requestId.isEmpty()) return@post
            reactApplicationContext.getJSModule(RCTNativeAppEventEmitter::class.java)
                .emit(AdropChannel.invokeRewardedChannelOf(requestId), Arguments.createMap().apply {
                    putString("unitId", ad.unitId)
                    putString("method", AdropMethod.HANDLE_EARN_REWARD)
                    putInt("type", type)
                    putInt("amount", amount)
                })
        }
    }

    override fun onAdFailedToReceive(ad: AdropRewardedAd, errorCode: AdropErrorCode) {
        sendEvent(ad, AdropMethod.DID_FAIL_TO_RECEIVE_AD, errorCode = errorCode.name)
    }

    override fun onAdReceived(ad: AdropRewardedAd) {
        sendEvent(ad, AdropMethod.DID_RECEIVE_AD)
    }

    override fun onAdClicked(ad: AdropRewardedAd) {
        sendEvent(ad, AdropMethod.DID_CLICK_AD)
    }

    override fun onAdImpression(ad: AdropRewardedAd) {
        sendEvent(ad, AdropMethod.DID_IMPRESSION)
    }

    override fun onAdDidDismissFullScreen(ad: AdropRewardedAd) {
        sendEvent(ad, AdropMethod.DID_DISMISS_FULL_SCREEN)
    }

    override fun onAdDidPresentFullScreen(ad: AdropRewardedAd) {
        sendEvent(ad, AdropMethod.DID_PRESENT_FULL_SCREEN)
    }

    override fun onAdFailedToShowFullScreen(ad: AdropRewardedAd, errorCode: AdropErrorCode) {
        sendEvent(ad, AdropMethod.DID_FAIL_TO_SHOW_FULL_SCREEN, errorCode = errorCode.name)
    }

    companion object {
        const val NAME = "AdropRewardedAd"
    }
}
