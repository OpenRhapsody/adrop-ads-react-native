package io.adrop.webview

import android.graphics.Color
import android.webkit.WebView
import android.webkit.WebSettings
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import android.webkit.ConsoleMessage
import android.os.Build
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

                // Additional settings for video playback
                allowFileAccess = true
                allowContentAccess = true
                loadWithOverviewMode = true
                useWideViewPort = true

                // Allow mixed content for video sources
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            }

            // Enable hardware acceleration for video
            setLayerType(WebView.LAYER_TYPE_HARDWARE, null)

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

        webView.settings.apply {
            javaScriptEnabled = true
            mediaPlaybackRequiresUserGesture = false
            domStorageEnabled = true
            cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK
            textZoom = 100
        }

        webView.loadDataWithBaseURL("https://adrop.io", data, "text/html", "UTF-8", null)
    }

    companion object {
        const val NAME = "AdropWebView"
    }
}
