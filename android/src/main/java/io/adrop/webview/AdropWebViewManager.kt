package io.adrop.webview

import android.util.Log
import android.graphics.Color
import android.webkit.WebView
import android.webkit.WebViewClient
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import io.adrop.ads.banner.AdropBanner
import io.adrop.ads.banner.AdropBannerListener
import io.adrop.ads.model.AdropErrorCode
import io.adrop.bridge.AdropChannel
import io.adrop.bridge.AdropMethod

class AdropWebViewManager () : SimpleViewManager<RNAdropWebView>() {

    override fun getName(): String = NAME

    override fun createViewInstance(context: ThemedReactContext): RNAdropWebView {
        val webView = RNAdropWebView(context)
        webView.apply {
            settings.apply {
                javaScriptEnabled = true
                mediaPlaybackRequiresUserGesture = false
                domStorageEnabled = true
            }

            webViewClient = object : WebViewClient() {

            }
            setBackgroundColor(Color.TRANSPARENT)
        }
        return webView
    }

    override fun receiveCommand(webView: RNAdropWebView, command: String?, args: ReadableArray?) {
        super.receiveCommand(webView, command, args)
    }
    @ReactProp(name = "data")
    fun setData(webView: RNAdropWebView, data: String) {
        webView.isFocusable = false
        webView.isClickable = false
        webView.isFocusableInTouchMode = false
        webView.loadDataWithBaseURL("https://adrop.io", data, "text/html", "UTF-8", null)
    }

    companion object {
        const val NAME = "AdropWebView"
    }
}
