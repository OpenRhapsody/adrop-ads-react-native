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
}
