package io.adrop

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
import io.adrop.bridge.AdropChannel
import io.adrop.bridge.AdropMethod

class AdropRewardedAdModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), AdropRewardedAdListener {

    private val _rewardedAds = mutableMapOf<String, AdropRewardedAd>()

    override fun getName(): String = NAME

    @ReactMethod
    fun create(unitId: String, requestId: String) {
        _rewardedAds[requestId] ?: let {
            val rewardedAd = AdropRewardedAd(reactApplicationContext, unitId)
            rewardedAd.rewardedAdListener = this
            _rewardedAds[requestId] = rewardedAd
        }
    }

    @ReactMethod
    fun load(unitId: String, requestId: String) {
        _rewardedAds[requestId]?.load()
    }

    @ReactMethod
    fun show(unitId: String, requestId: String) {
        _rewardedAds[requestId]?.let {
            currentActivity?.let { fromActivity ->
                it.show(fromActivity) { type, amount ->
                    sendEarnEvent(unitId, requestId, type, amount)
                }
            }
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
        _rewardedAds.remove(requestId)?.let {
            it.destroy()
        }
    }

    private fun requestIdFor(ad: AdropRewardedAd?): String {
        _rewardedAds.entries.find { it.value == ad }?.let { return it.key }
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
            .emit(AdropChannel.invokeRewardedChannelOf(requestId), Arguments.createMap().apply {
                putString("unitId", unitId)
                putString("method", method)
                putString("creativeId", creativeId)
                putString("errorCode", errorCode)
            })
    }

    private fun sendEarnEvent(unitId: String, requestId: String, type: Int, amount: Int) {
        reactApplicationContext.getJSModule(RCTNativeAppEventEmitter::class.java)
            .emit(AdropChannel.invokeRewardedChannelOf(requestId), Arguments.createMap().apply {
                putString("unitId", unitId)
                putString("method", AdropMethod.HANDLE_EARN_REWARD)
                putInt("type", type)
                putInt("amount", amount)
            })
    }

    override fun onAdFailedToReceive(ad: AdropRewardedAd, errorCode: AdropErrorCode) {
        sendEvent(ad.unitId, requestIdFor(ad), AdropMethod.DID_FAIL_TO_RECEIVE_AD, errorCode = errorCode.name)
    }

    override fun onAdReceived(ad: AdropRewardedAd) {
        sendEvent(ad.unitId, requestIdFor(ad), AdropMethod.DID_RECEIVE_AD, creativeId = ad.creativeId)
    }

    override fun onAdClicked(ad: AdropRewardedAd) {
        sendEvent(ad.unitId, requestIdFor(ad), AdropMethod.DID_CLICK_AD)
    }

    override fun onAdImpression(ad: AdropRewardedAd) {
        sendEvent(ad.unitId, requestIdFor(ad), AdropMethod.DID_IMPRESSION)
    }

    override fun onAdDidDismissFullScreen(ad: AdropRewardedAd) {
        sendEvent(ad.unitId, requestIdFor(ad), AdropMethod.DID_DISMISS_FULL_SCREEN)
    }

    override fun onAdDidPresentFullScreen(ad: AdropRewardedAd) {
        sendEvent(ad.unitId, requestIdFor(ad), AdropMethod.DID_PRESENT_FULL_SCREEN)
    }

    override fun onAdFailedToShowFullScreen(ad: AdropRewardedAd, errorCode: AdropErrorCode) {
        sendEvent(
            ad.unitId,
            requestIdFor(ad),
            AdropMethod.DID_FAIL_TO_SHOW_FULL_SCREEN,
            errorCode = errorCode.name
        )
    }

    companion object {
        const val NAME = "AdropRewardedAd"
    }
}
