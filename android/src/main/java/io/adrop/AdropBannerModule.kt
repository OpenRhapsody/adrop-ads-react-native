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
import com.facebook.react.modules.core.RCTNativeAppEventEmitter
import io.adrop.ads.banner.AdropBanner
import io.adrop.ads.banner.AdropBannerListener
import io.adrop.ads.model.AdropErrorCode
import io.adrop.banner.AdropPreloadedBannerStore
import io.adrop.bridge.AdropChannel
import io.adrop.bridge.AdropMethod

/**
 * NativeModule backing the batch `AdropBanner.loads()` JS API.
 *
 * Batch flow: one network call, up to 5 pre-loaded banners bound positionally
 * to the JS-minted requestIds. A per-call listener handles only the terminal
 * batch callbacks; after registration each banner's listener is swapped to
 * this module so per-instance events (click/impression/video) are emitted on
 * the requestId-keyed preloaded channel (docs/decisions/batch-loads-api.md §2).
 */
class AdropBannerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), AdropBannerListener {

    private val handler = Handler(Looper.getMainLooper())

    override fun getName(): String = NAME

    @ReactMethod
    fun loads(unitId: String, requestIds: ReadableArray, useCustomClick: Boolean, promise: Promise) {
        val ids = (0 until requestIds.size()).mapNotNull { requestIds.getString(it) }

        // Per-call listener: captures this call's promise + ids so concurrent
        // batches can't cross wires (a singleton listener couldn't tell whose
        // onAdsReceived fired).
        val batchListener = object : AdropBannerListener {
            override fun onAdsReceived(banners: List<AdropBanner>) {
                val filled = Arguments.createArray()
                val metas = Arguments.createArray()
                banners.forEachIndexed { index, banner ->
                    if (index >= ids.size) {
                        // Cap-drift guard — destroying inside onAdsReceived races
                        // the queued WebView load, so post it. Must be the main
                        // Handler, not View.post(): the surplus banner is never
                        // attached to a window, so View.post() would queue the
                        // runnable forever (same fix as Flutter AdropBannerManager).
                        handler.post { banner.destroy() }
                        return@forEachIndexed
                    }
                    val requestId = ids[index]
                    banner.useCustomClick = useCustomClick
                    banner.listener = this@AdropBannerModule
                    AdropPreloadedBannerStore.banners[requestId] = banner
                    filled.pushString(requestId)
                    metas.pushMap(payloadOf(banner, requestId))
                }
                val response = Arguments.createMap()
                response.putArray("requestIds", filled)
                response.putArray("ads", metas)
                promise.resolve(response)
            }

            override fun onAdsFailedToReceive(errorCode: AdropErrorCode) {
                promise.reject(errorCode.name, "AdropBanner.loads failed")
            }

            // Singular callbacks can only fire between auto-attach and the swap
            // above — nothing is mounted yet, so they are intentionally dropped.
            override fun onAdReceived(banner: AdropBanner) {}
            override fun onAdClicked(banner: AdropBanner) {}
            override fun onAdFailedToReceive(banner: AdropBanner, error: AdropErrorCode) {}
        }

        // Main-thread entry per the module thread-safety decision.
        handler.post {
            AdropBanner.loads(reactContext, unitId, null, batchListener)
        }
    }

    @ReactMethod
    fun destroy(requestId: String) {
        handler.post {
            AdropPreloadedBannerStore.banners.remove(requestId)?.destroy()
        }
    }

    // NativeEventEmitter contract: without these no-op stubs, RN dev mode logs
    // "Module AdropBanner requires main queue setup / addListener" warnings.
    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}

    /**
     * Dev reload keeps the process (and this registry) alive while every JS
     * reference dies — sweep so each reload doesn't stack up to 5 WebViews.
     */
    override fun invalidate() {
        handler.post {
            AdropPreloadedBannerStore.banners.values.forEach { it.destroy() }
            AdropPreloadedBannerStore.banners.clear()
        }
        super.invalidate()
    }

    /**
     * Single payload builder for both the loads() response and every emitted
     * event (SSOT within the preloaded path). Field set mirrors the frozen
     * singular builder in AdropBannerViewManager.sendEvent — keep in sync.
     */
    private fun payloadOf(
        banner: AdropBanner,
        requestId: String,
        method: String? = null,
        errorCode: String? = null
    ): WritableMap {
        return Arguments.createMap().apply {
            putString("unitId", banner.getUnitId())
            putString("requestId", requestId)
            method?.let { putString("method", it) }
            errorCode?.let { putString("errorCode", it) }
            putString("creativeId", banner.creativeId)
            putString("txId", banner.txId)
            putString("campaignId", banner.campaignId)
            putString("destinationURL", banner.destinationURL)
            putDouble("creativeSizeWidth", banner.creativeSize.width)
            putDouble("creativeSizeHeight", banner.creativeSize.height)
            putInt("browserTarget", banner.browserTarget)
            putString("creativeType", banner.creativeType)
        }
    }

    private fun sendEvent(banner: AdropBanner, method: String, errorCode: String? = null) {
        handler.post {
            val requestId = AdropPreloadedBannerStore.requestIdFor(banner)
            if (requestId.isEmpty()) return@post
            reactContext.getJSModule(RCTNativeAppEventEmitter::class.java)
                .emit(
                    AdropChannel.invokePreloadedBannerChannel,
                    payloadOf(banner, requestId, method, errorCode)
                )
        }
    }

    // Swap-target listener — full override set (a missed override silently
    // drops that event for every preloaded banner).
    override fun onAdReceived(banner: AdropBanner) {
        // The batch path never re-fires the singular onAdReceived (native
        // contract); nothing to emit.
    }

    override fun onAdClicked(banner: AdropBanner) {
        sendEvent(banner, AdropMethod.DID_CLICK_AD)
    }

    override fun onAdImpression(banner: AdropBanner) {
        sendEvent(banner, AdropMethod.DID_IMPRESSION)
    }

    override fun onAdFailedToReceive(banner: AdropBanner, error: AdropErrorCode) {
        sendEvent(banner, AdropMethod.DID_FAIL_TO_RECEIVE_AD, error.name)
    }

    override fun onAdVideoStart(banner: AdropBanner) {
        sendEvent(banner, AdropMethod.DID_VIDEO_START)
    }

    override fun onAdVideoEnd(banner: AdropBanner) {
        sendEvent(banner, AdropMethod.DID_VIDEO_END)
    }

    companion object {
        const val NAME = "AdropBanner"
    }
}
