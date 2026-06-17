package io.adrop

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import io.adrop.banner.AdropBannerViewManager
import io.adrop.webview.AdropWebViewManager
import io.adrop.native.AdropNativeAdViewManager
import io.adrop.native.AdropMediaViewManager

/**
 * BaseReactPackage works for BOTH architectures:
 * - Old Architecture: modules are resolved lazily via [getModule].
 * - New Architecture: the same [getModule] + [getReactModuleInfoProvider]
 *   feeds the TurboModule manager; modules whose spec base extends the codegen
 *   `Native*Spec` are vended as TurboModules.
 *
 * ⚠️ BUILD-VERIFY: the [ReactModuleInfo] constructor arity changes across RN
 * versions. This uses the 6-arg form (name, className, canOverrideExistingModule,
 * needsEagerInit, isCxxModule, isTurboModule). Adjust if the target RN expects a
 * different signature.
 */
class AdropAdsPackage : BaseReactPackage() {

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
        when (name) {
            AdropAdsModule.NAME -> AdropAdsModule(reactContext)
            AdropInterstitialAdModule.NAME -> AdropInterstitialAdModule(reactContext)
            AdropRewardedAdModule.NAME -> AdropRewardedAdModule(reactContext)
            AdropMetricsModule.NAME -> AdropMetricsModule(reactContext)
            AdropPopupAdModule.NAME -> AdropPopupAdModule(reactContext)
            AdropNativeAdModule.NAME -> AdropNativeAdModule(reactContext)
            AdropConsentModule.NAME -> AdropConsentModule(reactContext)
            else -> null
        }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        val isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        val names = listOf(
            AdropAdsModule.NAME,
            AdropInterstitialAdModule.NAME,
            AdropRewardedAdModule.NAME,
            AdropMetricsModule.NAME,
            AdropPopupAdModule.NAME,
            AdropNativeAdModule.NAME,
            AdropConsentModule.NAME
        )
        return ReactModuleInfoProvider {
            names.associateWith { name ->
                ReactModuleInfo(
                    name,
                    name,
                    false, // canOverrideExistingModule
                    false, // needsEagerInit
                    false, // isCxxModule
                    isTurboModule
                )
            }
        }
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return listOf(
            AdropBannerViewManager(reactContext),
            AdropWebViewManager(),
            AdropNativeAdViewManager(),
            AdropMediaViewManager(reactContext)
        )
    }
}
