import { Adrop } from '../src'
import { NativeModules } from 'react-native'

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native')
    RN.NativeModules.AdropAds = {
        initialize: jest.fn(),
        setUID: jest.fn(),
        setTheme: jest.fn(),
        setMarketingConsent: jest.fn(),
        registerWebView: jest.fn().mockResolvedValue(undefined),
    }

    const eventEmitter = {
        addListener: jest.fn(),
        removeListeners: jest.fn(),
    }

    RN.NativeModules.BannerEventEmitter = eventEmitter
    RN.NativeModules.EventEmitter = eventEmitter
    RN.NativeModules.AdropInterstitialAd = eventEmitter
    RN.NativeModules.AdropRewardedAd = eventEmitter

    // mock modules created through UIManager
    RN.UIManager.getViewManagerConfig = (name: string) => {
        if (name === 'AdropAds') {
            return { initialize: jest.fn() }
        }
        return {}
    }
    return RN
})

describe('Adrop Test', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    test('initialize production', () => {
        Adrop.initialize(true)
        expect(NativeModules.AdropAds.initialize).toHaveBeenCalledWith(
            true,
            [],
            false
        )
    })

    test('initialize dev mode', () => {
        Adrop.initialize(false)
        expect(NativeModules.AdropAds.initialize).toHaveBeenCalledWith(
            false,
            [],
            false
        )
    })

    test('initialize with targetCountries', () => {
        Adrop.initialize(true, ['KR', 'US'])
        expect(NativeModules.AdropAds.initialize).toHaveBeenCalledWith(
            true,
            ['KR', 'US'],
            false
        )
    })

    test('initialize with useInAppBrowser', () => {
        Adrop.initialize(true, [], true)
        expect(NativeModules.AdropAds.initialize).toHaveBeenCalledWith(
            true,
            [],
            true
        )
    })

    test('setUID calls native', () => {
        Adrop.setUID('user123')
        expect(NativeModules.AdropAds.setUID).toHaveBeenCalledWith('user123')
    })

    test('setTheme calls native', () => {
        Adrop.setTheme('dark' as any)
        expect(NativeModules.AdropAds.setTheme).toHaveBeenCalledWith('dark')
    })

    test('registerWebView calls native with viewTag', () => {
        Adrop.registerWebView(42)
        expect(NativeModules.AdropAds.registerWebView).toHaveBeenCalledWith(42)
    })

    describe('registerWebView dev warning', () => {
        let warn: jest.SpyInstance

        beforeEach(() => {
            warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
        })

        afterEach(() => {
            warn.mockRestore()
        })

        test('warns once when native reports no WebView was registered', async () => {
            NativeModules.AdropAds.registerWebView.mockResolvedValueOnce(false)
            await expect(Adrop.registerWebView(42)).resolves.toBeUndefined()
            expect(warn).toHaveBeenCalledTimes(1)
            expect(warn.mock.calls[0][0]).toContain('collapsable={false}')
        })

        test.each([true, undefined, null])(
            'does not warn when native resolves %p',
            async (value) => {
                NativeModules.AdropAds.registerWebView.mockResolvedValueOnce(
                    value
                )
                await Adrop.registerWebView(42)
                expect(warn).not.toHaveBeenCalled()
            }
        )
    })

    test('setMarketingConsent forwards true to native module', () => {
        Adrop.setMarketingConsent(true)
        expect(NativeModules.AdropAds.setMarketingConsent).toHaveBeenCalledWith(
            true
        )
    })

    test('setMarketingConsent forwards false to native module', () => {
        Adrop.setMarketingConsent(false)
        expect(NativeModules.AdropAds.setMarketingConsent).toHaveBeenCalledWith(
            false
        )
    })

    test('setMarketingConsent returns void (not a Promise)', () => {
        const result = Adrop.setMarketingConsent(true)
        expect(result).toBeUndefined()
    })
})
