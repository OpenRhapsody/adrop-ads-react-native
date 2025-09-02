package io.adrop.native

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.view.MotionEvent
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.LinearLayout.LayoutParams
import io.adrop.R
import io.adrop.ads.nativeAd.AdropNativeAdView
import io.adrop.ads.nativeAd.AdropNativeAd
import io.adrop.ads.nativeAd.AdropMediaView


class RNAdropNativeView(context: Context, attrs: AttributeSet? = null) : LinearLayout(context, attrs) {

    var nativeAdView: AdropNativeAdView
    private var webViewRect: android.graphics.Rect? = null
    private var webView: View? = null

    init {
        val layoutInflater = LayoutInflater.from(context)
        val root: View = layoutInflater.inflate(R.layout.rn_adrop_native_ad_view, this, true)
        nativeAdView = root.findViewById<AdropNativeAdView>(R.id.adrop_native_view)
        nativeAdView.isEntireClick = true
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        nativeAdView.layout(0, 0, right - left, bottom - top)

        updateWebViewRect()
    }

    fun setNativeAd(nativeAd: AdropNativeAd) {
        nativeAdView.setNativeAd(nativeAd)
        if (nativeAd.creative.contains("<video") && nativeAd.useCustomClick) {
            nativeAdView.isEntireClick = false
        }
        post { updateWebViewRect() }
    }

    fun setMediaView(id: Int) {
        val mediaView = findViewById<RNAdropMediaView>(id)
        mediaView?.let {
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
}
