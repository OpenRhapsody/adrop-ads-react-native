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

    fun setPendingNativeAd(requestId: String?) {
        requestId ?: return
        pendingRequestId = requestId

        // Remove any pending callbacks
        removeCallbacks(setNativeAdRunnable)

        // Post with delay to ensure all views are set first
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
        // For AdMob ads, ensure MediaView is set (required for impression tracking)
        if (nativeAd.isBackfilled && mediaView == null) {
            val hiddenMediaView = RNAdropMediaView(context)
            hiddenMediaView.layoutParams = FrameLayout.LayoutParams(1, 1) // 1x1 pixel
            hiddenMediaView.visibility = View.INVISIBLE
            nativeAdView.addView(hiddenMediaView)
            mediaView = hiddenMediaView
            nativeAdView.setMediaView(hiddenMediaView)
        }

        nativeAdView.setNativeAd(nativeAd)

        // For AdMob backfill ads, trigger viewability detection
        if (nativeAd.isBackfilled) {
            triggerAdMobViewabilityCheck()
        }

        // Check MediaView and force child layout for AdMob media content
        mediaView?.let {
            postDelayed({
                for (i in 0 until it.childCount) {
                    val child = it.getChildAt(i)

                    // Force child to have correct size
                    if (child.width == 0 || child.height == 0) {
                        child.layoutParams = FrameLayout.LayoutParams(
                            FrameLayout.LayoutParams.MATCH_PARENT,
                            FrameLayout.LayoutParams.MATCH_PARENT
                        )
                        child.measure(
                            View.MeasureSpec.makeMeasureSpec(it.width, View.MeasureSpec.EXACTLY),
                            View.MeasureSpec.makeMeasureSpec(it.height, View.MeasureSpec.EXACTLY)
                        )
                        child.layout(0, 0, it.width, it.height)
                    }

                    // For AdMob MediaView, also force layout of its children (ImageView inside MediaView)
                    if (child is ViewGroup && child.javaClass.name.contains("MediaView")) {
                        // Use ViewTreeObserver to track when MediaView's layout is complete
                        setupMediaViewLayoutObserver(child)
                    }
                }

                // Force layout
                it.requestLayout()
                it.invalidate()
            }, 100)
        }

        if (nativeAd.creative.contains("<video") && nativeAd.useCustomClick) {
            nativeAdView.isEntireClick = false
        }
        post { updateWebViewRect() }
    }

    fun setMediaView(id: Int) {
        val foundMediaView = findViewById<RNAdropMediaView>(id)

        foundMediaView?.let {
            mediaView = it

            nativeAdView.setMediaView(it as AdropMediaView)

            it.requestLayout()
        }
    }

    // Handle video ads

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
            if (child.javaClass.name.contains("WebView")) {
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
    private var mediaViewLayoutRunnable: Runnable? = null

    private fun setupMediaViewLayoutObserver(mediaView: ViewGroup) {
        // Initial force layout
        forceMediaViewImageViewSize(mediaView)

        // Remove previous listener if exists
        mediaViewLayoutListener?.let {
            mediaView.viewTreeObserver.removeOnGlobalLayoutListener(it)
        }

        // Use ViewTreeObserver to monitor layout changes
        mediaViewLayoutListener = object : android.view.ViewTreeObserver.OnGlobalLayoutListener {
            private var layoutCount = 0
            private val maxLayoutAttempts = 3

            override fun onGlobalLayout() {
                layoutCount++

                // Force layout on all children
                forceMediaViewImageViewSize(mediaView)

                // Remove listener after max attempts
                if (layoutCount >= maxLayoutAttempts) {
                    mediaView.viewTreeObserver.removeOnGlobalLayoutListener(this)
                    mediaViewLayoutListener = null
                }
            }
        }
        mediaView.viewTreeObserver.addOnGlobalLayoutListener(mediaViewLayoutListener)

        // Remove previous runnable if exists
        mediaViewLayoutRunnable?.let {
            mediaView.removeCallbacks(it)
        }

        // Also force layout after delays as fallback
        mediaViewLayoutRunnable = Runnable {
            if (isAttachedToWindow) {
                forceMediaViewImageViewSize(mediaView)
                mediaView.requestLayout()
            }
        }
        mediaView.postDelayed(mediaViewLayoutRunnable, 300)
    }

    private fun forceMediaViewImageViewSize(mediaView: ViewGroup) {
        // Force size on all children of the MediaView, especially ImageViews
        for (i in 0 until mediaView.childCount) {
            val child = mediaView.getChildAt(i)

            // Always force size, even if it's not 0x0
            val parentWidth = mediaView.width
            val parentHeight = mediaView.height

            if (parentWidth > 0 && parentHeight > 0) {
                // Set layout params to match parent
                val lp = child.layoutParams ?: FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT
                )
                lp.width = FrameLayout.LayoutParams.MATCH_PARENT
                lp.height = FrameLayout.LayoutParams.MATCH_PARENT
                child.layoutParams = lp

                // Force measure and layout
                child.measure(
                    View.MeasureSpec.makeMeasureSpec(parentWidth, View.MeasureSpec.EXACTLY),
                    View.MeasureSpec.makeMeasureSpec(parentHeight, View.MeasureSpec.EXACTLY)
                )
                child.layout(0, 0, parentWidth, parentHeight)

                // Special handling for ImageView
                if (child is ImageView) {
                    child.scaleType = ImageView.ScaleType.FIT_CENTER
                    child.adjustViewBounds = true

                    // Force visibility
                    child.visibility = View.VISIBLE
                    child.alpha = 1.0f
                }

                child.requestLayout()
                child.invalidate()

                // If this is a ViewGroup, recurse
                if (child is ViewGroup) {
                    forceMediaViewImageViewSize(child)
                }
            }
        }
    }

    private fun triggerAdMobViewabilityCheck() {
        // Clear any pending runnables first
        clearPendingRunnables()

        // Strategy: Force AdMob's OM SDK to detect viewability by triggering multiple signals
        val delays = listOf(0L, 100L, 300L, 500L, 1000L)

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
        // Trigger global layout listeners (which OM SDK uses for viewability detection)
        if (viewTreeObserver.isAlive) {
            viewTreeObserver.dispatchOnGlobalLayout()
        }

        // Force layout pass
        requestLayout()
        invalidate()

        // Also trigger on nativeAdView
        nativeAdView.requestLayout()
        nativeAdView.invalidate()

        // Trigger on mediaView if exists
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
        // Clean up all pending callbacks to prevent memory leaks
        clearPendingRunnables()
        removeCallbacks(setNativeAdRunnable)

        // Clean up mediaView observers
        mediaViewLayoutListener?.let {
            mediaView?.viewTreeObserver?.removeOnGlobalLayoutListener(it)
            mediaViewLayoutListener = null
        }
        mediaViewLayoutRunnable?.let {
            mediaView?.removeCallbacks(it)
            mediaViewLayoutRunnable = null
        }
    }
}
