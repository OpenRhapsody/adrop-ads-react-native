package io.adrop

import android.app.Application
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.UIManagerModule
import io.adrop.ads.Adrop
import io.adrop.ads.model.AdropErrorCode
import io.adrop.ads.model.AdropTheme
import java.lang.Exception

class AdropAdsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun initialize(production: Boolean, targetCountries: ReadableArray, useInAppBrowser: Boolean) {
        val context = reactApplicationContext.applicationContext
        if (context is Application) {
            val countries = Array(targetCountries.size()) { index -> targetCountries.getString(index) ?: "" }
            Adrop.initialize(context, production, countries)
        } else {
            throw Exception(AdropErrorCode.ERROR_CODE_INITIALIZE.name)
        }
    }

    @ReactMethod
    fun setUID(uid: String) {
        if (uid.isEmpty()) return

        Adrop.setUID(uid)
    }

    @ReactMethod
    fun setTheme(theme: String) {
        val converted = when (theme.lowercase()) {
            "light" -> AdropTheme.LIGHT
            "dark" -> AdropTheme.DARK
            else -> AdropTheme.AUTO
        }

        Adrop.setTheme(converted)
    }

    @ReactMethod
    fun setMarketingConsent(consent: Boolean) {
        Adrop.setMarketingConsent(consent)
    }

    @ReactMethod
    fun registerWebView(viewTag: Int, promise: Promise) {
        val uiManager = reactApplicationContext.getNativeModule(UIManagerModule::class.java)
        if (uiManager == null) {
            promise.resolve(null)
            return
        }
        uiManager.addUIBlock { nativeViewHierarchyManager ->
            try {
                val view = nativeViewHierarchyManager.resolveView(viewTag)
                val webView = findWebView(view)
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
