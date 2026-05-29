/**
 * Preferred placement for the AdChoices icon on AdMob backfill native ads.
 *
 * - Passed to the backfill network (e.g. AdMob) as a *position hint*; the
 *   network may force a different position per policy.
 * - Has no effect on direct (Adrop) ads — the direct creative is HTML and the
 *   AdChoices icon concept is AdMob-specific.
 * - The default `topRight` matches the AdMob SDK default.
 */
export enum AdropAdChoicesPosition {
    topLeft = 0,
    topRight = 1,
    bottomLeft = 2,
    bottomRight = 3,
}
