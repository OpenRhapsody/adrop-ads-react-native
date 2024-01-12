package io.adrop.banner

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
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


class AdropBannerViewManager(private val context: ReactApplicationContext) :
    SimpleViewManager<AdropBanner>(), AdropBannerListener {

    override fun getName(): String = "AdropBannerView"

    override fun createViewInstance(context: ThemedReactContext): AdropBanner {
        val banner = AdropBanner(context, null)
        banner.listener = this
        return banner
    }

    override fun receiveCommand(banner: AdropBanner, command: String?, args: ReadableArray?) {
        super.receiveCommand(banner, command, args)

        when (command) {
            LOAD -> banner.load()
        }
    }

    @ReactProp(name = "unitId")
    fun setUnitId(banner: AdropBanner, unitId: String) {
        banner.setUnitId(unitId)
        sendEvent(banner.id, AdropMethod.DID_CREATED_AD_BANNER)
    }

    override fun onAdClicked(banner: AdropBanner) {
        sendEvent(banner.id, AdropMethod.DID_CLICK_AD)
    }

    override fun onAdFailedToReceive(banner: AdropBanner, errorCode: AdropErrorCode) {
        sendEvent(banner.id, AdropMethod.DID_FAIL_TO_RECEIVE_AD, errorCode.name)
    }

    override fun onAdReceived(banner: AdropBanner) {
        sendEvent(banner.id, AdropMethod.DID_RECEIVE_AD)
    }

    private fun sendEvent(viewTag: Int, method: String, errorCode: String? = null) {
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(AdropChannel.invokeBannerChannel, Arguments.createMap().apply {
                putString("method", method)
                putString("errorCode", errorCode)
                putInt("tag", viewTag)
            })
    }

    companion object {
        private const val LOAD = "load"
    }
}
