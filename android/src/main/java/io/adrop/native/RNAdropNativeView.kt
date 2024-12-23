package io.adrop.native

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.LinearLayout
import android.widget.LinearLayout.LayoutParams
import io.adrop.R
import io.adrop.ads.nativeAd.AdropNativeAdView
import io.adrop.ads.nativeAd.AdropNativeAd
import io.adrop.ads.nativeAd.AdropMediaView


class RNAdropNativeView(context: Context, attrs: AttributeSet? = null) : LinearLayout(context, attrs) {

    var nativeAdView: AdropNativeAdView

    init {
        val layoutInflater = LayoutInflater.from(context)
        val root: View = layoutInflater.inflate(R.layout.rn_adrop_native_ad_view, this, true)
        nativeAdView = root.findViewById<AdropNativeAdView>(R.id.adrop_native_view)
        nativeAdView.isEntireClick = true
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        nativeAdView.layout(0, 0, right - left, bottom - top)
    }

    fun setNativeAd(nativeAd: AdropNativeAd) {
        nativeAdView.setNativeAd(nativeAd)
    }

    fun setMediaView(id: Int) {
        val mediaView = findViewById<RNAdropMediaView>(id)
        mediaView?.let {
            nativeAdView.setMediaView(it as AdropMediaView)
            it.requestLayout()
        }
    }
}
