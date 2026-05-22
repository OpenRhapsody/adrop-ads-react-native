/**
 * Preferred display position for the AdChoices icon on AdMob-backfilled native ads.
 *
 * - A *preferred position hint* forwarded to backfill networks such as AdMob;
 *   the network may enforce a different position per its policies.
 * - Not applied to direct-sold (Adrop) ads — direct ad creatives are HTML, and
 *   the AdChoices icon is an AdMob-only concept.
 * - The default `topRight` matches the AdMob SDK default.
 */
export enum AdropAdChoicesPosition {
    topLeft = 0,
    topRight = 1,
    bottomLeft = 2,
    bottomRight = 3,
}
