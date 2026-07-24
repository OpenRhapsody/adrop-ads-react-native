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

    private val tagByUnitId: MutableMap<String, Int> = mutableMapOf()

    override fun getName(): String = "AdropBannerView"

    override fun createViewInstance(context: ThemedReactContext): AdropBanner {
        val banner = AdropBanner(context, null)
        banner.listener = this
        return banner
    }

    /**
     * RN unmount cleanup — without this, a JS unmount never calls destroy() so the WebView
     * (and any embedded backfill AdView) leaks. Mirrors AdropNativeAdViewManager: super first,
     * then release. destroy() is idempotent, so overlapping with a media company's explicit
     * destroy() is safe. tagByUnitId is keyed by unitId (unknown here) so remove by value == view.id.
     */
    override fun onDropViewInstance(view: AdropBanner) {
        super.onDropViewInstance(view)
        view.listener = null
        view.destroy()
        tagByUnitId.entries.removeAll { it.value == view.id }
    }

    override fun receiveCommand(banner: AdropBanner, command: String?, args: ReadableArray?) {
        super.receiveCommand(banner, command, args)

        when (command) {
            LOAD -> banner.load()
            PLAY -> banner.play()
            PAUSE -> banner.pause()
        }
    }

    @ReactProp(name = "unitId")
    fun setUnitId(banner: AdropBanner, unitId: String) {
        banner.setUnitId(unitId)
        tagByUnitId[unitId] = banner.id
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
        banner.post {
            forceLayoutRecursive(banner)
            // Nudge AdMob's viewability check so the backfill impression fires: the AdView is
            // injected into RN's layout and doesn't receive the scroll/draw events AdMob's
            // viewability observers rely on, so a momentary scroll (±1px, net 0) triggers
            // OnScrollChangedListener without touching the global-layout path.
            // Rationale, limits, and the root-cause alternative:
            // docs/decisions/banner-backfill-impression-viewability.md
            val sx = banner.scrollX
            val sy = banner.scrollY
            banner.scrollTo(sx, sy + 1)
            banner.scrollTo(sx, sy)
        }
    }

    private fun forceLayoutRecursive(view: android.view.View) {
        val width = view.width
        val height = view.height

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

                forceLayoutRecursive(child)
            }
        }

        // Do NOT call viewTreeObserver.dispatchOnGlobalLayout() here. ViewTreeObserver
        // is a single instance shared at the window level
        // (ViewRootImpl.mAttachInfo.mTreeObserver), so there is no such thing as a
        // "subtree scoped" dispatch — calling it on any child View synchronously fires
        // every listener registered on the window from the main thread. Being at the
        // tail of this recursion, it ran once per view in the subtree and collided
        // with listeners registered by react-native-screens' ScreenContainer
        // (Fragment commit flow), which was the root cause of ANRs on low-end devices
        // (dispatch accounted for 95-98% of this method's time; see
        // react-native/docs/banner_anr_global_layout_plan.md). Same fix as RNAdropNativeView.
        // The explicit measure/layout above is what actually sizes the backfill
        // AdView under RN's Yoga layout — that part stays.
    }

    override fun onAdImpression(banner: AdropBanner) {
        sendEvent(banner, AdropMethod.DID_IMPRESSION)
    }

    override fun onAdVideoStart(banner: AdropBanner) {
        sendEvent(banner, AdropMethod.DID_VIDEO_START)
    }

    override fun onAdVideoEnd(banner: AdropBanner) {
        sendEvent(banner, AdropMethod.DID_VIDEO_END)
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
                putInt("browserTarget", banner.browserTarget)
                putString("creativeType", banner.creativeType)
            })
    }

    companion object {
        private const val LOAD = "load"
        private const val PLAY = "play"
        private const val PAUSE = "pause"
    }
}
