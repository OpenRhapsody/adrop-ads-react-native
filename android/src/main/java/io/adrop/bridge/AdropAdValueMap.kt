package io.adrop.bridge

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import io.adrop.ads.model.AdropAdValue
import io.adrop.ads.model.AdropAdValuePrecision

/**
 * Serializes [AdropAdValue] for the JS side.
 *
 * Single source of truth for the payload — the keys and the `precision` spelling must match
 * the `AdropAdValue` type in `src/ads/AdropAdValue.ts` and the iOS counterpart
 * (`AdropAdValue+Map.swift`). Keeping one copy per platform is what stops the two bridges
 * from drifting apart.
 */
fun AdropAdValue.toWritableMap(): WritableMap = Arguments.createMap().apply {
    putString("network", network)
    // Omit rather than send null, so JS reads it as undefined like the TS type says.
    adSourceName?.let { putString("adSourceName", it) }
    // WritableMap has no putLong. JS numbers are exact below 2^53, far above any real
    // micros value, whereas putInt would silently overflow in low-denomination currencies.
    putDouble("valueMicros", valueMicros.toDouble())
    putString("currencyCode", currencyCode)
    putString("precision", precision.jsName)
}

/** Stable wire name; never `name.lowercase()`, which would emit `publisher_provided`. */
val AdropAdValuePrecision.jsName: String
    get() = when (this) {
        AdropAdValuePrecision.UNKNOWN -> "unknown"
        AdropAdValuePrecision.ESTIMATED -> "estimated"
        AdropAdValuePrecision.PUBLISHER_PROVIDED -> "publisherProvided"
        AdropAdValuePrecision.PRECISE -> "precise"
    }
