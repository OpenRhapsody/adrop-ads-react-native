/**
 * Accuracy of {@link AdropAdValue.valueMicros}. Mirrors AdMob's four precision types.
 */
export type AdropAdValuePrecision =
    | 'unknown'
    | 'estimated'
    | 'publisherProvided'
    | 'precise'

/**
 * Impression-level ad revenue for a single backfill impression.
 *
 * Delivered together with the ad that earned it, so read `unitId`, `txId` and friends from
 * that ad rather than from here.
 *
 * Adrop direct ads never fire this. The value is the ad provider's own gross estimate,
 * not a settlement figure.
 */
export type AdropAdValue = {
    /** Backfill provider that served the ad, e.g. `'admob'`. */
    network: string
    /** Mediation ad source inside the provider (e.g. `'AppLovin'`), absent when unknown. */
    adSourceName?: string
    /** Revenue in 1/1,000,000 of `currencyCode`. */
    valueMicros: number
    /** ISO 4217 currency code, passed through from the provider. */
    currencyCode: string
    /** How accurate `valueMicros` is. */
    precision: AdropAdValuePrecision
    /**
     * The original, pre-hash UID passed to `Adrop.setUID`, absent when it was never set.
     *
     * Use it to attribute this impression's revenue to a user in your own analytics or MMP.
     * It is the value you supplied: Adrop keeps a SHA-256 hash of it as its internal user id,
     * and already sends the raw value to Adrop's own servers in its remote-config sync
     * (`RemoteConfigInput.externalUid` — not the ad request). Reading it here sends it nowhere
     * new, and the ad provider never receives it.
     */
    externalUid?: string
}
