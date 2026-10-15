package io.adrop

import android.app.Application
import android.content.pm.ApplicationInfo
import android.util.Log
import android.view.Choreographer
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.UIManagerModule
import com.facebook.react.uimanager.common.UIManagerType
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

    /**
     * Resolves `true` when a WebView was found and passed to [Adrop.registerWebView], `false` otherwise.
     * Never rejects — `Adrop.registerWebView` on the JS side turns `false` into a dev warning.
     */
    @ReactMethod
    fun registerWebView(viewTag: Int, promise: Promise) {
        // Fabric tags are even (React allocates them from 2 in steps of 2). Checked inline because
        // ViewUtil.getUIManagerType is deprecated since RN 0.86 — on 0.72 it does exactly this check.
        if (viewTag % 2 == 0) {
            UiThreadUtil.runOnUiThread { registerFabricWebView(viewTag, promise, 0) }
            return
        }
        // Paper: addUIBlock runs after pending view operations, so the view exists even if
        // onLayout reached JS before the UI thread created it (RN 0.72 UIImplementation).
        val uiManager = reactApplicationContext.getNativeModule(UIManagerModule::class.java)
        if (uiManager == null) {
            // Bridgeless has no UIManagerModule, only Fabric — so an odd tag there means React no
            // longer allocates Fabric tags as even numbers. Don't rely on parity; look it up in Fabric.
            UiThreadUtil.runOnUiThread { registerFabricWebView(viewTag, promise, 0) }
            return
        }
        uiManager.addUIBlock { nativeViewHierarchyManager ->
            val view = try {
                nativeViewHierarchyManager.resolveView(viewTag)
            } catch (_: Throwable) {
                null // throws when the tag has no native view
            }
            val webView = view?.let { findWebView(it) }
            when {
                view == null -> {
                    Log.w(TAG, noNativeViewMessage(viewTag))
                    promise.resolve(false)
                }
                webView == null -> {
                    Log.w(TAG, noWebViewMessage(viewTag))
                    promise.resolve(false)
                }
                else -> promise.resolve(passToAdrop(webView, viewTag, 0))
            }
        }
    }

    // Runs on the UI thread only (resolveView asserts it).
    private fun registerFabricWebView(viewTag: Int, promise: Promise, attempt: Int) {
        val view = try {
            UIManagerHelper.getUIManager(reactApplicationContext, UIManagerType.FABRIC)?.resolveView(viewTag)
        } catch (_: Throwable) {
            null // missing tags return null; throws only when a ViewState exists without a View
        }
        val webView = view?.let { findWebView(it) }
        if (webView == null) {
            if (attempt < MAX_MOUNT_WAIT_FRAMES) {
                // Mount items from a non-UI-thread commit are dispatched on a later frame, and the
                // wrapper may be preallocated before its WebView child is mounted — wait for both.
                Choreographer.getInstance().postFrameCallback {
                    registerFabricWebView(viewTag, promise, attempt + 1)
                }
                return
            }
            Log.w(TAG, if (view == null) noNativeViewMessage(viewTag) else noWebViewMessage(viewTag))
            promise.resolve(false)
            return
        }
        promise.resolve(passToAdrop(webView, viewTag, attempt))
    }

    // The backfill register handler (webView.settings, MobileAds.registerWebView) does not catch,
    // so an exception here would crash the app from a frame callback and leave the promise pending.
    private fun passToAdrop(webView: WebView, viewTag: Int, attempt: Int): Boolean {
        return try {
            Adrop.registerWebView(webView)
            if (isDebuggable) {
                Log.d(TAG, "registerWebView: passed WebView for tag $viewTag to Adrop (after $attempt frames)")
            }
            true
        } catch (t: Throwable) {
            Log.w(TAG, "registerWebView: Adrop.registerWebView threw for tag $viewTag", t)
            false
        }
    }

    // BuildConfig.DEBUG is unavailable here (buildConfig is off) and would reflect the library's
    // build type rather than the app's.
    private val isDebuggable: Boolean
        get() = (reactApplicationContext.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0

    private fun noNativeViewMessage(viewTag: Int) =
        "registerWebView: no native view for tag $viewTag (New Architecture: add collapsable={false} to the wrapper View)"

    private fun noWebViewMessage(viewTag: Int) =
        "registerWebView: no WebView inside view for tag $viewTag"

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
        private const val TAG = NAME

        // Normal mounts finish within 1-2 frames. The cap only bounds cases where the view never
        // appears (flattened wrapper, unmount) so the hook's isReady is not held back for long:
        // 30 frames ≈ 0.5s at 60Hz, ≈ 0.25s at 120Hz. Counted in frames because mounting is frame-driven.
        private const val MAX_MOUNT_WAIT_FRAMES = 30
    }
}
