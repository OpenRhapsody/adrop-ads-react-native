package io.adrop.banner

import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

/**
 * Host for a banner pre-loaded by `AdropBanner.loads()`. RN lays out only the
 * views it creates, so children added natively need a manual measure/layout
 * pass ([requestLayout] override — the standard RN wrapper pattern; never use
 * dispatchOnGlobalLayout, see react-native/docs/banner_anr_global_layout_plan.md).
 */
class AdropPreloadedBannerHostView(context: Context) : FrameLayout(context) {

    private val measureAndLayout = Runnable {
        measure(
            MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
        )
        layout(left, top, right, bottom)
    }

    override fun requestLayout() {
        super.requestLayout()
        post(measureAndLayout)
    }

    /**
     * Steal-attach: an Android View cannot join a second parent, and with list
     * recycling (or a same-frame remount) the previous host may still hold the
     * banner — take it over. Sanctioned by the native reference example
     * (kotlinapp LoadsExampleActivity).
     */
    fun attach(banner: View) {
        if (banner.parent === this) return
        // Evict this host's previous banner first. React reuses the host view
        // and only pushes the changed `requestId` prop (state swap / key={index}),
        // so onDropViewInstance never fires — without this the old banner stays
        // a child, hidden under the new one but still visibility-tracked and
        // playing video (occlusion is invisible to VisibilityTracker).
        // Detach only: its lifetime stays with AdropBanner.destroyLoaded().
        removeAllViews()
        (banner.parent as? ViewGroup)?.removeView(banner)
        addView(
            banner,
            LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        )
    }
}

class AdropPreloadedBannerViewManager(
    @Suppress("unused") private val reactContext: ReactApplicationContext
) : SimpleViewManager<AdropPreloadedBannerHostView>() {

    override fun getName(): String = NAME

    override fun createViewInstance(reactContext: ThemedReactContext): AdropPreloadedBannerHostView {
        return AdropPreloadedBannerHostView(reactContext)
    }

    @ReactProp(name = "requestId")
    fun setRequestId(view: AdropPreloadedBannerHostView, requestId: String?) {
        val banner = requestId?.let { AdropPreloadedBannerStore.banners[it] } ?: return
        view.attach(banner)
    }

    /**
     * Detach-only (re-attach contract): the banner must NOT be destroyed here
     * — its lifetime is owned by `AdropBanner.destroyLoaded()` — and its
     * listener must stay attached or events die after a re-mount. This is the
     * deliberate opposite of AdropBannerViewManager.onDropViewInstance
     * (unmount=destroy), which is why preloaded banners have their own manager.
     */
    override fun onDropViewInstance(view: AdropPreloadedBannerHostView) {
        view.removeAllViews()
        super.onDropViewInstance(view)
    }

    companion object {
        const val NAME = "AdropPreloadedBannerView"
    }
}
