import { AdType } from '../ads/AdropAd'

export default class AdropChannel {
    private static methodChannel = 'io.adrop.adrop-ads'
    static bannerEventListenerChannel = `${this.methodChannel}/banner`

    static adropEventListenerChannel = (adType: AdType, id: string): string => {
        switch (adType) {
            case AdType.adropInterstitialAd:
                return `${this.methodChannel}/interstitial_${id}`
            case AdType.adropRewardedAd:
                return `${this.methodChannel}/rewarded_${id}`
            case AdType.adropPopupAd:
                return `${this.methodChannel}/popup_${id}`
            case AdType.adropNativeAd:
                return `${this.methodChannel}/native_${id}`
            default:
                return ''
        }
    }
}
