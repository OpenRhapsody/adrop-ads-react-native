package io.adrop.native

import android.view.View
import android.graphics.Color
import android.widget.ImageView
import android.widget.TextView
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import io.adrop.ads.nativeAd.AdropMediaView
import io.adrop.ads.nativeAd.AdropNativeAd

class AdropNativeAdViewManager() : ViewGroupManager<RNAdropNativeView>() {


    override fun getName(): String = "AdropNativeAdView"

    override fun createViewInstance(context: ThemedReactContext): RNAdropNativeView {
        return RNAdropNativeView(context)
    }

    override fun addView(parent: RNAdropNativeView, child: View, index: Int) {
        parent.addView(child, index)
    }

    @ReactProp(name = ICON)
    fun setIconView(view: RNAdropNativeView, map: ReadableMap) {
        val iconView = view.findViewById<ImageView>(map.getInt(TAG))
        iconView?.let { view.nativeAdView.setIconView(it) }
        setNativeAd(view, map.getString(REQUEST_ID))
    }

    @ReactProp(name = HEADLINE)
    fun setHeadlineView(view: RNAdropNativeView, map: ReadableMap) {
        val headlineView = view.findViewById<TextView>(map.getInt(TAG))
        headlineView?.let { view.nativeAdView.setHeadLineView(it) }
        setNativeAd(view, map.getString(REQUEST_ID))
    }

    @ReactProp(name = BODY)
    fun setBodyView(view: RNAdropNativeView, map: ReadableMap) {
        val bodyView = view.findViewById<TextView>(map.getInt(TAG))
        bodyView?.let { view.nativeAdView.setBodyView(it) }
        setNativeAd(view, map.getString(REQUEST_ID))
    }

    @ReactProp(name = MEDIA)
    fun setMediaView(view: RNAdropNativeView, map: ReadableMap) {
        try {
            view.setMediaView(map.getInt(TAG))
            setNativeAd(view, map.getString(REQUEST_ID))
        } catch (e: Exception) {
        }
    }

    @ReactProp(name = CTA)
    fun setCallToActionView(view: RNAdropNativeView, map: ReadableMap) {
        val cta = view.findViewById<TextView>(map.getInt(TAG))
        cta?.let { view.nativeAdView.setCallToActionView(it) }
        setNativeAd(view, map.getString(REQUEST_ID))
    }

    @ReactProp(name = ADVERTISER)
    fun setAdvertiserView(view: RNAdropNativeView, map: ReadableMap) {
        val advertiser = view.findViewById<TextView>(map.getInt(TAG))
        advertiser?.let { view.nativeAdView.setAdvertiserView(it) }
        setNativeAd(view, map.getString(REQUEST_ID))
    }

    @ReactProp(name = PROFILE_NAME)
    fun setProfileNameView(view: RNAdropNativeView, map: ReadableMap) {
        val profileNameView = view.findViewById<TextView>(map.getInt(TAG))
        profileNameView?.let { view.nativeAdView.setProfileNameView(it) }
        setNativeAd(view, map.getString(REQUEST_ID))
    }

    @ReactProp(name = PROFILE_LOGO)
    fun setProfileLogoView(view: RNAdropNativeView, map: ReadableMap) {
        val profileLogoView = view.findViewById<ImageView>(map.getInt(TAG))
        profileLogoView?.let { view.nativeAdView.setProfileLogoView(it) }
        setNativeAd(view, map.getString(REQUEST_ID))
    }

    private fun setNativeAd(view: RNAdropNativeView, requestId: String?) {
        requestId?: return

        AdropNativeAdManager.getAd(requestId)?.let {
            view.setNativeAd(it)
        }
    }

    companion object {
        const val ICON = "icon"
        const val HEADLINE = "headline"
        const val BODY = "body"
        const val ADVERTISER = "advertiser"
        const val MEDIA = "mediaView"
        const val CTA = "callToAction"
        const val PROFILE_NAME = "profileName"
        const val PROFILE_LOGO = "profileLogo"

        const val SET_NATIVE_AD = "setNativeAd"
        const val TAG = "tag"
        const val REQUEST_ID = "requestId"
    }
}
