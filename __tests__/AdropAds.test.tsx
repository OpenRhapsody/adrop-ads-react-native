import { Adrop } from '../src'
import { NativeModules } from 'react-native'

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native')
    RN.NativeModules.AdropAds = {
        initialize: jest.fn(),
        setUID: jest.fn(),
        setTheme: jest.fn(),
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
})
