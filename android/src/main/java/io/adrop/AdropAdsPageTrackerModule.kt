package io.adrop

import android.app.Application
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import io.adrop.analytics.PageTracker

class AdropAdsPageTrackerModule (reactContext: ReactApplicationContext):
    ReactContextBaseJavaModule(reactContext) {

    private var pageTracker: PageTracker? = null

    init {
        val context = reactApplicationContext.applicationContext
        if (context is Application) {
            pageTracker = PageTracker(context)
        }
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun track(page: String, size: Int) {
        pageTracker?.track(page, size)
    }

    @ReactMethod
    fun attach(page: String, unitId: String) {
        pageTracker?.attach(unitId, page)
    }

    companion object {
        const val NAME = "AdropPageTracker"
    }
}
