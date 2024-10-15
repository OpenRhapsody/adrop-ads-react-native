package io.adrop

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import io.adrop.banner.AdropBannerViewManager
import io.adrop.webview.AdropWebViewManager
import io.adrop.native.AdropNativeAdViewManager
import io.adrop.native.AdropMediaViewManager

class AdropAdsPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(
            AdropAdsModule(reactContext),
            AdropInterstitialAdModule(reactContext),
            AdropRewardedAdModule(reactContext),
            AdropMetricsModule(reactContext),
            AdropPopupAdModule(reactContext),
            AdropNativeAdModule(reactContext)
        )
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return listOf(
            AdropBannerViewManager(reactContext),
            AdropWebViewManager(),
            AdropNativeAdViewManager()
        )
    }
}
