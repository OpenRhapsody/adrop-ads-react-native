package io.adrop.bridge

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import io.adrop.ads.consent.AdropConsentResult

/**
 * Serializes [AdropConsentResult] for the JS side.
 *
 * Single source of truth for the payload — the keys must match the `AdropConsentResult` type in
 * `src/consent/AdropConsentResult.ts` and the iOS counterpart (`AdropConsentResult+Map.swift`).
 * requestConsentInfoUpdate and showPrivacyOptionsForm both resolve with this payload.
 */
fun AdropConsentResult.toWritableMap(): WritableMap = Arguments.createMap().apply {
    putInt("status", status.value)
    putBoolean("canRequestAds", canRequestAds)
    putBoolean("canShowPersonalizedAds", canShowPersonalizedAds)
    // Omit rather than send null, so JS reads it as undefined like the TS type says.
    error?.let { putString("error", it.message) }
}
