import AdropBannerComponent, { type AdropBannerMetadata } from './AdropBanner'
import {
    loadsBanners,
    destroyLoadedBanner,
    type AdropBannerHandle,
    type AdropBannerLoadsOptions,
    type AdropPreloadedBannerListener,
} from './AdropBannerLoads'
import AdropPreloadedBanner, {
    type AdropPreloadedBannerProp,
} from './AdropPreloadedBanner'
import AdropInterstitialAd from './AdropInterstitialAd'
import AdropNativeAd from './AdropNativeAd'
import AdropPopupAd from './AdropPopupAd'
import AdropRewardedAd from './AdropRewardedAd'
import { BrowserTarget, type AdropListener } from './AdropAd'
import { AdropAdChoicesPosition } from './AdropAdChoicesPosition'
import type { AdropPopupAdColors } from './AdropPopupAd'
import type {
    AdropNativeAdListener,
    AdropNativeAdLoadsOptions,
} from './AdropNativeAd'

/**
 * `<AdropBanner>` component with the batch statics attached:
 * `AdropBanner.loads(options)` / `AdropBanner.destroyLoaded(handle)`.
 */
const AdropBanner = Object.assign(AdropBannerComponent, {
    loads: loadsBanners,
    destroyLoaded: destroyLoadedBanner,
})

export {
    AdropBanner,
    AdropPreloadedBanner,
    type AdropBannerMetadata,
    type AdropBannerHandle,
    type AdropBannerLoadsOptions,
    type AdropPreloadedBannerListener,
    type AdropPreloadedBannerProp,
    AdropInterstitialAd,
    AdropNativeAd,
    AdropPopupAd,
    AdropRewardedAd,
    BrowserTarget,
    AdropAdChoicesPosition,
}
export type {
    AdropListener,
    AdropPopupAdColors,
    AdropNativeAdListener,
    AdropNativeAdLoadsOptions,
}
export type { ServerSideVerificationOptions } from './AdropRewardedAd'
