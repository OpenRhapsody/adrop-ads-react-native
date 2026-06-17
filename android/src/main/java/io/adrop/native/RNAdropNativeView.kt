package io.adrop.native

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.view.MotionEvent
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.FrameLayout
import android.widget.LinearLayout
import io.adrop.R
import io.adrop.ads.nativeAd.AdropNativeAdView
import io.adrop.ads.nativeAd.AdropNativeAd
import io.adrop.ads.nativeAd.AdropMediaView


class RNAdropNativeView(context: Context, attrs: AttributeSet? = null) : LinearLayout(context, attrs) {

    var nativeAdView: AdropNativeAdView
    private var webViewRect: android.graphics.Rect? = null
    private var webView: View? = null
    private var mediaView: AdropMediaView? = null
    private var pendingRequestId: String? = null
    private val pendingRunnables = mutableListOf<Runnable>()
    private var backfillRefreshObserver: BackfillRefreshObserver? = null

    /**
     * Tracking list for children added through RN ViewManager.addView.
     *
     * Physically the children live inside nativeAdView (or, when the backfill wrap is
     * active, inside the inner NativeAdView wrapper), but RN's view tree tracks them as
     * direct children of RNAdropNativeView. To reconcile this mismatch the ViewManager
     * delegates getChildCount / getChildAt / removeViewAt / addView to this list (the
     * default implementation only reports RNAdropNativeView's real direct child, the
     * inflated adView, which causes RN's first manageChildren call to remove the adView
     * itself and triggers a cascade of IllegalViewOperationException).
     */
    private val rnChildren = mutableListOf<View>()
    private val setNativeAdRunnable = Runnable {
        pendingRequestId?.let { requestId ->
            AdropNativeAdManager.getAd(requestId)?.let { ad ->
                setNativeAd(ad)
            }
            pendingRequestId = null
        }
    }

    init {
        val layoutInflater = LayoutInflater.from(context)
        val root: View = layoutInflater.inflate(R.layout.rn_adrop_native_ad_view, this, true)
        nativeAdView = root.findViewById<AdropNativeAdView>(R.id.adrop_native_view)
        nativeAdView.isEntireClick = true
    }

    /**
     * Register a child that arrived via ViewManager.addView into the RN tracking list,
     * then actually attach it to nativeAdView. The tracking list is unaffected by
     * wrap/unwrap cycles and guarantees an ordering consistent with RN's index basis.
     */
    fun addRnChild(child: View, index: Int) {
        val safeIndex = index.coerceIn(0, rnChildren.size)
        rnChildren.add(safeIndex, child)
        try {
            nativeAdView.addView(child, safeIndex)
        } catch (e: IllegalStateException) {
            // Race where the same child is already attached to another parent — detach and retry.
            (child.parent as? ViewGroup)?.removeView(child)
            try {
                nativeAdView.addView(child, safeIndex)
            } catch (retry: IllegalStateException) {
                // If the retry also fails, drop from the list to keep rnChildren consistent.
                rnChildren.remove(child)
            }
        }
    }

    fun getRnChildCount(): Int = rnChildren.size

    fun getRnChildAt(index: Int): View? = rnChildren.getOrNull(index)

    /**
     * Remove a child by its index in the RN tracking list. When the backfill wrap is
     * active the child's real parent may be the wrap NativeAdView rather than
     * nativeAdView, so remove it from whichever ViewGroup it currently sits in via
     * `child.parent`.
     */
    fun removeRnChildAt(index: Int) {
        if (index < 0 || index >= rnChildren.size) return
        val child = rnChildren.removeAt(index)
        (child.parent as? ViewGroup)?.removeView(child)
    }

    fun setPendingNativeAd(requestId: String?) {
        requestId ?: return
        pendingRequestId = requestId

        removeCallbacks(setNativeAdRunnable)
        postDelayed(setNativeAdRunnable, 50)
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        val width = right - left
        val height = bottom - top
        nativeAdView.layout(0, 0, width, height)

        updateWebViewRect()
    }

    fun setNativeAd(nativeAd: AdropNativeAd) {
        // New Architecture (Fabric): asset props are not in the codegen spec, so
        // `setNativeProps({ mediaView: { tag } })` never reaches @ReactProp setMediaView
        // (only `nativeAdRequestId` propagates). The media view is still mounted in the
        // subtree via the legacy-interop layer, so locate and bind it here. On the Old
        // Architecture this is a no-op because setMediaView already bound it.
        if (mediaView == null) {
            findMediaViewInTree(nativeAdView)?.let {
                mediaView = it
                nativeAdView.setMediaView(it)
            }
        }

        if (nativeAd.isBackfilled && mediaView == null) {
            val hiddenMediaView = RNAdropMediaView(context)
            hiddenMediaView.layoutParams = FrameLayout.LayoutParams(1, 1)
            hiddenMediaView.visibility = View.INVISIBLE
            nativeAdView.addView(hiddenMediaView)
            mediaView = hiddenMediaView
            nativeAdView.setMediaView(hiddenMediaView)
        }

        nativeAdView.setNativeAd(nativeAd)

        if (nativeAd.isBackfilled) {
            attachBackfillRefreshObserverIfNeeded()
            triggerAdMobViewabilityCheck()
        }

        mediaView?.let {
            postDelayed({
                forceMediaViewChildLayout(it, forceAll = false)
            }, 100)
        }

        if (nativeAd.creative.contains("<video") && nativeAd.useCustomClick) {
            nativeAdView.isEntireClick = false
        }
        post { updateWebViewRect() }
    }

    fun setMediaView(id: Int) {
        // Old Architecture: findViewById(reactTag) returns the RNAdropMediaView directly.
        // New Architecture (Fabric): the legacy `MediaView` component is mounted inside a
        // LegacyViewManagerInteropComponentView wrapper, so findViewById(reactTag) returns
        // that wrapper (or null), never RNAdropMediaView — the cast fails and the media
        // view is never bound. Resolve by searching the real view subtree for an
        // AdropMediaView instance instead of relying on the React tag.
        val byId = findViewById<View>(id)
        val foundMediaView = byId as? AdropMediaView
            ?: (byId as? ViewGroup)?.let { findMediaViewInTree(it) }
            ?: findMediaViewInTree(nativeAdView)

        foundMediaView?.let {
            mediaView = it

            nativeAdView.setMediaView(it)

            it.requestLayout()
        }
    }

    /** Depth-first search for the first AdropMediaView in the given subtree. */
    private fun findMediaViewInTree(root: ViewGroup): AdropMediaView? {
        for (i in 0 until root.childCount) {
            val child = root.getChildAt(i)
            if (child is AdropMediaView) return child
            if (child is ViewGroup) {
                findMediaViewInTree(child)?.let { return it }
            }
        }
        return null
    }

    private fun updateWebViewRect() {
        webView = findWebView(this)
        webView?.let { view ->
            val location = IntArray(2)
            view.getLocationInWindow(location)

            val parentLocation = IntArray(2)
            this.getLocationInWindow(parentLocation)

            val relativeLeft = location[0] - parentLocation[0]
            val relativeTop = location[1] - parentLocation[1]

            webViewRect = android.graphics.Rect(
                relativeLeft,
                relativeTop,
                relativeLeft + view.width,
                relativeTop + view.height
            )
        }
    }

    private fun findWebView(viewGroup: ViewGroup): View? {
        for (i in 0 until viewGroup.childCount) {
            val child = viewGroup.getChildAt(i)
            if (child is android.webkit.WebView) {
                return child
            }
            if (child is ViewGroup) {
                val found = findWebView(child)
                if (found != null) return found
            }
        }
        return null
    }

    override fun dispatchTouchEvent(ev: MotionEvent): Boolean {
        if (nativeAdView.isEntireClick) {
            return super.dispatchTouchEvent(ev)
        }

        webView?.let { view ->
            webViewRect?.let { rect ->
                val x = ev.x.toInt()
                val y = ev.y.toInt()

                if (rect.contains(x, y)) {
                    val webViewEvent = MotionEvent.obtain(ev)
                    webViewEvent.offsetLocation(-rect.left.toFloat(), -rect.top.toFloat())
                    val handled = view.dispatchTouchEvent(webViewEvent)
                    webViewEvent.recycle()

                    if (handled) {
                        return true
                    }
                }
            }
        }
        return super.dispatchTouchEvent(ev)
    }

    override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
        if (nativeAdView.isEntireClick) {
            return super.onInterceptTouchEvent(ev)
        }

        webViewRect?.let { rect ->
            val x = ev.x.toInt()
            val y = ev.y.toInt()

            if (rect.contains(x, y)) {
                return false
            }
        }
        return super.onInterceptTouchEvent(ev)
    }

    private var mediaViewLayoutListener: android.view.ViewTreeObserver.OnGlobalLayoutListener? = null
    private var mediaViewLayoutObserver: android.view.ViewTreeObserver? = null
    private var mediaViewLayoutRunnable: Runnable? = null

    private fun setupMediaViewLayoutObserver(mediaView: ViewGroup) {
        forceMediaViewImageViewSize(mediaView)

        mediaViewLayoutListener?.let { listener ->
            mediaViewLayoutObserver?.let { vto ->
                if (vto.isAlive) vto.removeOnGlobalLayoutListener(listener)
            }
        }

        val vto = mediaView.viewTreeObserver
        mediaViewLayoutObserver = vto
        mediaViewLayoutListener = object : android.view.ViewTreeObserver.OnGlobalLayoutListener {
            private var layoutCount = 0
            private val maxLayoutAttempts = 3

            override fun onGlobalLayout() {
                layoutCount++

                forceMediaViewImageViewSize(mediaView)

                if (layoutCount >= maxLayoutAttempts) {
                    if (vto.isAlive) vto.removeOnGlobalLayoutListener(this)
                    mediaViewLayoutListener = null
                    mediaViewLayoutObserver = null
                }
            }
        }
        vto.addOnGlobalLayoutListener(mediaViewLayoutListener)

        mediaViewLayoutRunnable?.let {
            mediaView.removeCallbacks(it)
        }

        mediaViewLayoutRunnable = Runnable {
            if (isAttachedToWindow) {
                forceMediaViewImageViewSize(mediaView)
                mediaView.requestLayout()
            }
        }
        mediaView.postDelayed(mediaViewLayoutRunnable, 300)
    }

    private fun forceMediaViewImageViewSize(mediaView: ViewGroup) {
        for (i in 0 until mediaView.childCount) {
            val child = mediaView.getChildAt(i)

            val parentWidth = mediaView.width
            val parentHeight = mediaView.height

            if (parentWidth > 0 && parentHeight > 0) {
                val lp = child.layoutParams ?: FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT
                )
                lp.width = FrameLayout.LayoutParams.MATCH_PARENT
                lp.height = FrameLayout.LayoutParams.MATCH_PARENT
                child.layoutParams = lp

                child.measure(
                    View.MeasureSpec.makeMeasureSpec(parentWidth, View.MeasureSpec.EXACTLY),
                    View.MeasureSpec.makeMeasureSpec(parentHeight, View.MeasureSpec.EXACTLY)
                )
                child.layout(0, 0, parentWidth, parentHeight)

                if (child is ImageView) {
                    child.scaleType = ImageView.ScaleType.FIT_CENTER
                    child.adjustViewBounds = true

                    child.visibility = View.VISIBLE
                    child.alpha = 1.0f
                }

                child.requestLayout()
                child.invalidate()

                if (child is ViewGroup) {
                    forceMediaViewImageViewSize(child)
                }
            }
        }
    }

    private fun forceMediaViewChildLayout(mv: AdropMediaView, forceAll: Boolean) {
        for (i in 0 until mv.childCount) {
            val child = mv.getChildAt(i)

            if (forceAll || child.width == 0 || child.height == 0) {
                child.layoutParams = FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT
                )
                child.measure(
                    View.MeasureSpec.makeMeasureSpec(mv.width, View.MeasureSpec.EXACTLY),
                    View.MeasureSpec.makeMeasureSpec(mv.height, View.MeasureSpec.EXACTLY)
                )
                child.layout(0, 0, mv.width, mv.height)
            }

            if (child is ViewGroup && child.javaClass.name.contains("MediaView")) {
                setupMediaViewLayoutObserver(child)
            }
        }

        mv.requestLayout()
        mv.invalidate()
    }

    private fun attachBackfillRefreshObserverIfNeeded() {
        if (backfillRefreshObserver != null) return

        backfillRefreshObserver = BackfillRefreshObserver(nativeAdView) {
            handleBackfillRefresh()
        }
        backfillRefreshObserver?.attach()
    }

    private var pendingRefreshRunnable: Runnable? = null

    private fun handleBackfillRefresh() {
        mediaView?.let { mv ->
            pendingRefreshRunnable?.let { removeCallbacks(it) }

            val refreshRunnable = Runnable {
                if (isAttachedToWindow) {
                    forceMediaViewChildLayout(mv, forceAll = true)
                    triggerAdMobViewabilityCheck()
                }
                pendingRefreshRunnable = null
            }
            pendingRefreshRunnable = refreshRunnable
            pendingRunnables.add(refreshRunnable)
            postDelayed(refreshRunnable, 300)
        }
    }

    private fun triggerAdMobViewabilityCheck() {
        clearPendingRunnables()

        // Reduced from 5 to 2 passes (0/300ms). dispatchOnGlobalLayout() fully removed.
        // ViewTreeObserver is shared at the window level, so there is no such thing as
        // a "subtree scoped" dispatch — calling dispatch on any child View's vto fires
        // every listener registered on the window. AdMob's viewability is assumed to be
        // triggered sufficiently by OnAttachStateChangeListener and the natural layout pass.
        val delays = listOf(0L, 300L)

        delays.forEach { delay ->
            val runnable = Runnable {
                if (isAttachedToWindow) {
                    forceViewabilitySignals()
                }
            }
            pendingRunnables.add(runnable)

            if (delay == 0L) {
                post(runnable)
            } else {
                postDelayed(runnable, delay)
            }
        }
    }

    private fun forceViewabilitySignals() {
        requestLayout()
        invalidate()

        nativeAdView.requestLayout()
        nativeAdView.invalidate()

        // Do NOT call dispatchOnGlobalLayout(). ViewTreeObserver is a single instance
        // shared at the window level (ViewRootImpl.mAttachInfo.mTreeObserver), so
        // calling dispatch on any child View synchronously fires every listener
        // registered on the window from the main thread — this collided with listeners
        // registered by react-native-screens' ScreenContainer on the same window and
        // was the root cause of ANRs (top operational issue from partners, ~18.4%).
        // AdMob's viewability tracker now relies on setupLayoutListeners'
        // OnAttachStateChangeListener (measure/layout at attach time) and the natural
        // layout pass.
        mediaView?.let {
            it.requestLayout()
            it.invalidate()
        }
    }

    private fun clearPendingRunnables() {
        pendingRunnables.forEach { runnable ->
            removeCallbacks(runnable)
        }
        pendingRunnables.clear()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        clearPendingRunnables()
        removeCallbacks(setNativeAdRunnable)

        pendingRefreshRunnable?.let { removeCallbacks(it) }
        pendingRefreshRunnable = null

        backfillRefreshObserver?.detach()
        backfillRefreshObserver = null

        mediaViewLayoutListener?.let { listener ->
            mediaViewLayoutObserver?.let { vto ->
                if (vto.isAlive) vto.removeOnGlobalLayoutListener(listener)
            }
            mediaViewLayoutListener = null
            mediaViewLayoutObserver = null
        }
        mediaViewLayoutRunnable?.let {
            mediaView?.removeCallbacks(it)
            mediaViewLayoutRunnable = null
        }
    }
}
