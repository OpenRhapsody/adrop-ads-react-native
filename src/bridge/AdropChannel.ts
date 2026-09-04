import { AdType } from '../ads/AdropAd'

export default class AdropChannel {
    private static methodChannel = 'io.adrop.adrop-ads'
    static bannerEventListenerChannel = `${this.methodChannel}/banner`
    static nativeEventListenerChannel = `${this.methodChannel}/native`
    /**
     * Dedicated channel for batch-loaded (preloaded) banner events. Separate
     * from the tag-matched `/banner` channel: preloaded banners are keyed by
     * requestId (same unitId can fill several slots) and reusing `/banner`
     * would wake every mounted `<AdropBanner>` listener per event.
     */
    static preloadedBannerEventChannel = `${this.methodChannel}/preloaded_banner`

    static adropEventListenerChannel = (adType: AdType, id: string): string => {
        switch (adType) {
            case AdType.adropInterstitialAd:
                return `${this.methodChannel}/interstitial_${id}`
            case AdType.adropRewardedAd:
                return `${this.methodChannel}/rewarded_${id}`
            case AdType.adropPopupAd:
                return `${this.methodChannel}/popup_${id}`
            default:
                return ''
        }
    }
}
