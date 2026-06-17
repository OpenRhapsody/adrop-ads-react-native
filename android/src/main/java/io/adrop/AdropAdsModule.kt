package io.adrop

import android.app.Application
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.common.ViewUtil
import io.adrop.ads.Adrop
import io.adrop.ads.model.AdropErrorCode
import io.adrop.ads.model.AdropTheme
import java.lang.Exception

class AdropAdsModule(reactContext: ReactApplicationContext) :
    AdropAdsModuleSpec(reactContext) {

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    override fun initialize(production: Boolean, targetCountries: ReadableArray, useInAppBrowser: Boolean) {
        val context = reactApplicationContext.applicationContext
        if (context is Application) {
            val countries = Array(targetCountries.size()) { index -> targetCountries.getString(index) ?: "" }
            Adrop.initialize(context, production, countries)
        } else {
            throw Exception(AdropErrorCode.ERROR_CODE_INITIALIZE.name)
        }
    }

    @ReactMethod
    override fun setUID(uid: String) {
        if (uid.isEmpty()) return

        Adrop.setUID(uid)
    }

    @ReactMethod
    override fun setTheme(theme: String) {
        val converted = when (theme.lowercase()) {
            "light" -> AdropTheme.LIGHT
            "dark" -> AdropTheme.DARK
            else -> AdropTheme.AUTO
        }

        Adrop.setTheme(converted)
    }

    @ReactMethod
    override fun setMarketingConsent(consent: Boolean) {
        Adrop.setMarketingConsent(consent)
    }

    /**
     * Cross-architecture view resolution (Phase 3).
     *
     * Old Arch used `UIManagerModule.addUIBlock`, which does not exist under
     * Fabric/bridgeless. `UIManagerHelper.getUIManager` + `resolveView` resolves
     * the view on BOTH architectures (Fabric tag type detected via `ViewUtil`).
     *
     * ⚠️ BUILD-VERIFY: `viewTag` is `Double` to match codegen; converted with
     * `.toInt()`. Confirm `UIManagerHelper.getUIManager(ReactContext, int)` and
     * `ViewUtil.getUIManagerType(int)` signatures on the target RN.
     */
    @ReactMethod
    override fun registerWebView(viewTag: Double, promise: Promise) {
        val tag = viewTag.toInt()
        Handler(Looper.getMainLooper()).post {
            try {
                val uiManager = UIManagerHelper.getUIManager(
                    reactApplicationContext,
                    ViewUtil.getUIManagerType(tag)
                )
                val view = uiManager?.resolveView(tag)
                val webView = view?.let { findWebView(it) }
                if (webView != null) {
                    Adrop.registerWebView(webView)
                }
            } catch (_: Throwable) {
                // Silently ignore if the view cannot be resolved
            }
            promise.resolve(null)
        }
    }

    private fun findWebView(view: View): WebView? {
        if (view is WebView) return view
        if (view is ViewGroup) {
            for (i in 0 until view.childCount) {
                val found = findWebView(view.getChildAt(i))
                if (found != null) return found
            }
        }
        return null
    }

    companion object {
        const val NAME = "AdropAds"
    }
}
