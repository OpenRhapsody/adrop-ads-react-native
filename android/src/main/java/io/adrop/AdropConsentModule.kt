package io.adrop

import android.app.Activity
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import io.adrop.ads.Adrop
import io.adrop.ads.consent.AdropConsentDebugGeography
import io.adrop.ads.consent.AdropConsentListener
import io.adrop.ads.consent.AdropConsentManager
import io.adrop.ads.consent.AdropConsentResult
import io.adrop.ads.consent.AdropPrivacyOptionsRequirementStatus
import io.adrop.bridge.toWritableMap
import java.security.MessageDigest

class AdropConsentModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun requestConsentInfoUpdate(promise: Promise) {
        withManagerAndActivity(promise) { consentManager, activity ->
            consentManager.requestConsentInfoUpdate(activity, resolveWith(promise))
        }
    }

    @ReactMethod
    fun showPrivacyOptionsForm(promise: Promise) {
        withManagerAndActivity(promise) { consentManager, activity ->
            consentManager.showPrivacyOptionsForm(activity, resolveWith(promise))
        }
    }

    // Unlike the other consent getters, this resolves UNKNOWN instead of rejecting when there is no manager,
    // so a settings screen can decide whether to show the entry point without try/catch.
    @ReactMethod
    fun getPrivacyOptionsRequirementStatus(promise: Promise) {
        val context = reactApplicationContext
        UiThreadUtil.runOnUiThread {
            val status = Adrop.consentManager?.getPrivacyOptionsRequirementStatus(context)
                ?: AdropPrivacyOptionsRequirementStatus.UNKNOWN
            promise.resolve(status.value)
        }
    }

    /** Shared precondition checks and UI-thread hop for the two form-presenting methods */
    private inline fun withManagerAndActivity(
        promise: Promise,
        crossinline block: (AdropConsentManager, Activity) -> Unit
    ) {
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

        activity.runOnUiThread { block(consentManager, activity) }
    }

    private fun resolveWith(promise: Promise) = object : AdropConsentListener {
        override fun onConsentInfoUpdated(result: AdropConsentResult) {
            promise.resolve(result.toWritableMap())
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
