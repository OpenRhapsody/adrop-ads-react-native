package io.adrop

import android.app.Application
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import io.adrop.ads.Adrop
import io.adrop.ads.model.AdropErrorCode
import java.lang.Exception

class AdropAdsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return NAME
    }
    @ReactMethod
    fun initialize(production: Boolean, targetCountries: ReadableArray) {
        val context = reactApplicationContext.applicationContext
        if (context is Application) {
            val countries = Array(targetCountries.size()) { index -> targetCountries.getString(index) ?: "" }
            Adrop.initialize(context, production, countries)
        } else {
            throw Exception(AdropErrorCode.ERROR_CODE_INITIALIZE.name)
        }
    }

    companion object {
        const val NAME = "AdropAds"
    }
}
