package io.adrop

import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import io.adrop.ads.Adrop
import io.adrop.ads.consent.AdropConsentDebugGeography
import io.adrop.ads.consent.AdropConsentListener
import io.adrop.ads.consent.AdropConsentResult
import java.security.MessageDigest

class AdropConsentModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun requestConsentInfoUpdate(promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject("ERROR", "Activity is null")
            return
        }

        val consentManager = Adrop.consentManager
        if (consentManager == null) {
            promise.reject("ERROR", "ConsentManager is not available. Make sure adrop-ads-backfill is installed.")
            return
        }

        activity.runOnUiThread {
            consentManager.requestConsentInfoUpdate(activity, object : AdropConsentListener {
                override fun onConsentInfoUpdated(result: AdropConsentResult) {
                    val map = Arguments.createMap()
                    map.putInt("status", result.status.value)
                    map.putBoolean("canRequestAds", result.canRequestAds)
                    map.putBoolean("canShowPersonalizedAds", result.canShowPersonalizedAds)
                    result.error?.let { error ->
                        map.putString("error", error.message)
                    }
                    promise.resolve(map)
                }
            })
        }
    }

    @ReactMethod
    fun getConsentStatus(promise: Promise) {
        val context = reactApplicationContext
        val consentManager = Adrop.consentManager
        if (consentManager == null) {
            promise.reject("ERROR", "ConsentManager is not available. Make sure adrop-ads-backfill is installed.")
            return
        }

        val status = consentManager.getConsentStatus(context)
        promise.resolve(status.value)
    }

    @ReactMethod
    fun canRequestAds(promise: Promise) {
        val context = reactApplicationContext
        val consentManager = Adrop.consentManager
        if (consentManager == null) {
            promise.reject("ERROR", "ConsentManager is not available. Make sure adrop-ads-backfill is installed.")
            return
        }

        val canRequest = consentManager.canRequestAds(context)
        promise.resolve(canRequest)
    }

    @ReactMethod
    fun reset() {
        val context = reactApplicationContext
        val consentManager = Adrop.consentManager ?: return
        consentManager.reset(context)
    }

    @ReactMethod
    fun setDebugSettings(geography: Int) {
        val consentManager = Adrop.consentManager ?: return

        val androidId = Settings.Secure.getString(
            reactApplicationContext.contentResolver,
            Settings.Secure.ANDROID_ID
        )
        val hash = MessageDigest.getInstance("MD5")
            .digest(androidId.toByteArray())
            .joinToString("") { "%02X".format(it) }

        val debugGeography = when (geography) {
            0 -> AdropConsentDebugGeography.DISABLED
            1 -> AdropConsentDebugGeography.EEA
            2 -> AdropConsentDebugGeography.NOT_EEA
            3 -> AdropConsentDebugGeography.REGULATED_US_STATE
            4 -> AdropConsentDebugGeography.OTHER
            else -> AdropConsentDebugGeography.DISABLED
        }

        consentManager.setDebugSettings(listOf(hash), debugGeography)
    }

    companion object {
        const val NAME = "AdropConsent"
    }
}
