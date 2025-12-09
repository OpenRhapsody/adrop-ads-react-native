package io.adrop.banner

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.modules.core.RCTNativeAppEventEmitter
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import io.adrop.ads.banner.AdropBanner
import io.adrop.ads.banner.AdropBannerListener
import io.adrop.ads.model.AdropErrorCode
import io.adrop.ads.model.CreativeSize
import io.adrop.bridge.AdropChannel
import io.adrop.bridge.AdropMethod


class AdropBannerViewManager(private val context: ReactApplicationContext) :
    SimpleViewManager<AdropBanner>(), AdropBannerListener {

    override fun getName(): String = "AdropBannerView"

    override fun createViewInstance(context: ThemedReactContext): AdropBanner {
        val banner = AdropBanner(context, null)
        banner.listener = this
        return banner
    }

    override fun receiveCommand(banner: AdropBanner, command: String?, args: ReadableArray?) {
        super.receiveCommand(banner, command, args)

        when (command) {
            LOAD -> banner.load()
        }
    }

    @ReactProp(name = "unitId")
    fun setUnitId(banner: AdropBanner, unitId: String) {
        banner.setUnitId(unitId)
        sendEvent(banner, AdropMethod.DID_CREATED_AD_BANNER)
    }

    @ReactProp(name = "useCustomClick", defaultBoolean = false)
    fun setUseCustomClick(banner: AdropBanner, useCustomClick: Boolean) {
        banner.useCustomClick = useCustomClick
    }

    @ReactProp(name = "adSize")
    fun setAdSize(banner: AdropBanner, adSize: ReadableMap?) {
        if (adSize == null) return
        val width = adSize.getDouble("width")
        val height = adSize.getDouble("height")
        banner.adSize = CreativeSize(width, height)
    }

    override fun onAdClicked(banner: AdropBanner) {
        sendEvent(banner, AdropMethod.DID_CLICK_AD)
    }

    override fun onAdFailedToReceive(banner: AdropBanner, errorCode: AdropErrorCode) {
        sendEvent(banner, AdropMethod.DID_FAIL_TO_RECEIVE_AD, errorCode = errorCode.name)
    }

    override fun onAdReceived(banner: AdropBanner) {
        // Force layout update for React Native when backfill ad is added as child view
        if (banner.isBackfilled) {
            triggerBackfillViewability(banner)
        }

        sendEvent(banner, AdropMethod.DID_RECEIVE_AD)
    }

    private fun triggerBackfillViewability(banner: AdropBanner) {
        banner.post { forceLayoutRecursive(banner) }
    }

    private fun forceLayoutRecursive(view: android.view.View, depth: Int = 0) {
        val width = view.width
        val height = view.height
        val indent = "  ".repeat(depth)

        if (width > 0 && height > 0) {
            view.measure(
                android.view.View.MeasureSpec.makeMeasureSpec(width, android.view.View.MeasureSpec.EXACTLY),
                android.view.View.MeasureSpec.makeMeasureSpec(height, android.view.View.MeasureSpec.EXACTLY)
            )
            view.layout(view.left, view.top, view.right, view.bottom)
        }

        view.requestLayout()
        view.invalidate()

        if (view is android.view.ViewGroup) {
            for (i in 0 until view.childCount) {
                val child = view.getChildAt(i)
                child.visibility = android.view.View.VISIBLE

                val parentWidth = if (width > 0) width else view.measuredWidth
                val parentHeight = if (height > 0) height else view.measuredHeight

                if (child.width == 0 || child.height == 0) {
                    child.measure(
                        android.view.View.MeasureSpec.makeMeasureSpec(parentWidth, android.view.View.MeasureSpec.EXACTLY),
                        android.view.View.MeasureSpec.makeMeasureSpec(parentHeight, android.view.View.MeasureSpec.EXACTLY)
                    )
                    child.layout(0, 0, parentWidth, parentHeight)
                }

                forceLayoutRecursive(child, depth + 1)
            }
        }

        // Trigger global layout listeners
        view.viewTreeObserver.dispatchOnGlobalLayout()
    }

    override fun onAdImpression(banner: AdropBanner) {
        sendEvent(banner, AdropMethod.DID_IMPRESSION)
    }

    private fun sendEvent(banner: AdropBanner, method: String, errorCode: String? = null) {
        context.getJSModule(RCTNativeAppEventEmitter::class.java)
            .emit(AdropChannel.invokeBannerChannel, Arguments.createMap().apply {
                putString("method", method)
                putString("errorCode", errorCode)
                putString("creativeId", banner.creativeId)
                putString("destinationURL", banner.destinationURL)
                putString("txId", banner.txId)
                putString("campaignId", banner.campaignId)
                putInt("tag", banner.id)
            })
    }

    companion object {
        private const val LOAD = "load"
    }
}
