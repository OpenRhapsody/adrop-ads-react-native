package io.adrop

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.RCTNativeAppEventEmitter
import io.adrop.ads.model.AdropErrorCode
import io.adrop.ads.popupAd.AdropPopupAd
import io.adrop.ads.popupAd.AdropPopupAdListener
import io.adrop.bridge.AdropChannel
import io.adrop.bridge.AdropMethod
import java.util.concurrent.ConcurrentHashMap

class AdropPopupAdModule(reactContext: ReactApplicationContext) :
    AdropPopupAdModuleSpec(reactContext), AdropPopupAdListener {

    private val handler = Handler(Looper.getMainLooper())
    private val _popupAds = ConcurrentHashMap<String, AdropPopupAd>()

    override fun getName(): String = NAME

    @ReactMethod
    override fun create(unitId: String, requestId: String) {
        handler.post {
            _popupAds[requestId] ?: let {
                val popupAd = AdropPopupAd(reactApplicationContext, unitId)
                popupAd.popupAdListener = this
                _popupAds[requestId] = popupAd
            }
        }
    }

    @ReactMethod
    override fun load(unitId: String, requestId: String) {
        handler.post {
            _popupAds[requestId]?.load()
        }
    }

    @ReactMethod
    override fun show(unitId: String, requestId: String) {
        handler.post {
            _popupAds[requestId]?.let { ad ->
                reactApplicationContext.currentActivity?.let { fromActivity ->
                    ad.show(fromActivity)
                }
            }
                ?: reactApplicationContext.getJSModule(RCTNativeAppEventEmitter::class.java)
                    .emit(AdropChannel.invokePopupChannelOf(requestId), Arguments.createMap().apply {
                        putString("unitId", unitId)
                        putString("method", AdropMethod.DID_FAIL_TO_SHOW_FULL_SCREEN)
                        putString("errorCode", AdropErrorCode.ERROR_CODE_AD_EMPTY.name)
                    })
        }
    }

    @ReactMethod
    override fun customize(requestId: String, data: ReadableMap?) {
        handler.post {
            _popupAds[requestId]?.let { ad ->
                data?.entryIterator?.forEach {
                    val dataKey = it.key
                    val color = when (val value = it.value) {
                        is String -> hexStringToColorInt(value)
                        else -> 0
                    }

                    if (dataKey == "closeTextColor") {
                        ad.closeTextColor = color
                    }

                    if (dataKey == "hideForTodayTextColor" ) {
                        ad.hideForTodayTextColor = color
                    }

                    if (dataKey == "backgroundColor") {
                        ad.backgroundColor = color
                    }
                }
            }
        }
    }

    @ReactMethod
    override fun setUseCustomClick(requestId: String, useCustomClick: Boolean) {
        handler.post {
            _popupAds[requestId]?.let { ad ->
                ad.useCustomClick = useCustomClick
            }
        }
    }

    @ReactMethod
    override fun close(requestId: String) {
        handler.post {
            _popupAds[requestId]?.close()
        }
    }

    @ReactMethod
    override fun destroy(requestId: String) {
        handler.post {
            _popupAds.remove(requestId)?.destroy()
        }
    }

    @ReactMethod
    override fun addListener(eventName: String) {}

    @ReactMethod
    override fun removeListeners(count: Double) {}

    private fun hexStringToColorInt(hexString: String): Int {
        var hex = hexString.substring(1)
        if (hex.length == 3 || hex.length == 4) {
            hex = hex.map { "${it}${it}" }.joinToString("")
        }

        val alpha = if (hex.length == 8) hex.substring(0, 2).toInt(16) else 255
        val startIndex = if (hex.length == 8) 2 else 0

        val red = hex.substring(startIndex, startIndex + 2).toInt(16)
        val green = hex.substring(startIndex + 2, startIndex + 4).toInt(16)
        val blue = hex.substring(startIndex + 4, startIndex + 6).toInt(16)

        return (alpha shl 24) or (red shl 16) or (green shl 8) or blue
    }

    private fun requestIdFor(ad: AdropPopupAd?): String {
        _popupAds.entries.find { it.value == ad }?.let { return it.key }
        return ""
    }

    private fun sendEvent(
        ad: AdropPopupAd,
        method: String,
        errorCode: String? = null
    ) {
        handler.post {
            val requestId = requestIdFor(ad)
            if (requestId.isEmpty()) return@post
            reactApplicationContext.getJSModule(RCTNativeAppEventEmitter::class.java)
                .emit(AdropChannel.invokePopupChannelOf(requestId), Arguments.createMap().apply {
                    putString("unitId", ad.unitId)
                    putString("method", method)
                    putString("creativeId", ad.creativeId)
                    putString("txId", ad.txId)
                    putString("campaignId", ad.campaignId)
                    putString("destinationURL", ad.destinationURL)
                    putString("errorCode", errorCode)
                    putInt("browserTarget", ad.browserTarget)
                    putString("creativeType", ad.creativeType)
                })
        }
    }

    override fun onAdFailedToReceive(ad: AdropPopupAd, errorCode: AdropErrorCode) {
        sendEvent(ad, AdropMethod.DID_FAIL_TO_RECEIVE_AD, errorCode = errorCode.name)
    }

    override fun onAdReceived(ad: AdropPopupAd) {
        sendEvent(ad, AdropMethod.DID_RECEIVE_AD)
    }

    override fun onAdClicked(ad: AdropPopupAd) {
        sendEvent(ad, AdropMethod.DID_CLICK_AD)
    }

    override fun onAdImpression(ad: AdropPopupAd) {
        sendEvent(ad, AdropMethod.DID_IMPRESSION)
    }

    override fun onAdDidDismissFullScreen(ad: AdropPopupAd) {
        sendEvent(ad, AdropMethod.DID_DISMISS_FULL_SCREEN)
    }

    override fun onAdDidPresentFullScreen(ad: AdropPopupAd) {
        sendEvent(ad, AdropMethod.DID_PRESENT_FULL_SCREEN)
    }

    override fun onAdFailedToShowFullScreen(ad: AdropPopupAd, errorCode: AdropErrorCode) {
        sendEvent(ad, AdropMethod.DID_FAIL_TO_SHOW_FULL_SCREEN, errorCode = errorCode.name)
    }

    override fun onAdVideoStart(ad: AdropPopupAd) {
        sendEvent(ad, AdropMethod.DID_VIDEO_START)
    }

    override fun onAdVideoEnd(ad: AdropPopupAd) {
        sendEvent(ad, AdropMethod.DID_VIDEO_END)
    }

    companion object {
        const val NAME = "AdropPopupAd"
    }
}
