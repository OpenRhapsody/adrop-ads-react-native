import AdropChannel from '../src/bridge/AdropChannel'
import { AdType } from '../src/ads/AdropAd'

describe('AdropChannel', () => {
    test('bannerEventListenerChannel', () => {
        expect(AdropChannel.bannerEventListenerChannel).toBe(
            'io.adrop.adrop-ads/banner'
        )
    })

    test('nativeEventListenerChannel', () => {
        expect(AdropChannel.nativeEventListenerChannel).toBe(
            'io.adrop.adrop-ads/native'
        )
    })

    test('adropEventListenerChannel interstitial', () => {
        expect(
            AdropChannel.adropEventListenerChannel(
                AdType.adropInterstitialAd,
                'abc'
            )
        ).toBe('io.adrop.adrop-ads/interstitial_abc')
    })

    test('adropEventListenerChannel rewarded', () => {
        expect(
            AdropChannel.adropEventListenerChannel(
                AdType.adropRewardedAd,
                'abc'
            )
        ).toBe('io.adrop.adrop-ads/rewarded_abc')
    })

    test('adropEventListenerChannel popup', () => {
        expect(
            AdropChannel.adropEventListenerChannel(AdType.adropPopupAd, 'abc')
        ).toBe('io.adrop.adrop-ads/popup_abc')
    })

    test('adropEventListenerChannel nativeAd returns empty string', () => {
        expect(
            AdropChannel.adropEventListenerChannel(AdType.adropNativeAd, 'abc')
        ).toBe('')
    })
})
