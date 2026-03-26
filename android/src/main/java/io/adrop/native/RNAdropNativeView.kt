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
        val foundMediaView = findViewById<RNAdropMediaView>(id)

        foundMediaView?.let {
            mediaView = it

            nativeAdView.setMediaView(it as AdropMediaView)

            it.requestLayout()
        }
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
        if (viewTreeObserver.isAlive) {
            viewTreeObserver.dispatchOnGlobalLayout()
        }

        requestLayout()
        invalidate()

        nativeAdView.requestLayout()
        nativeAdView.invalidate()

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
