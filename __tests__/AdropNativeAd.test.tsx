import { AdropErrorCode } from '../src'
import AdropNativeAd from '../src/ads/AdropNativeAd'
import { DeviceEventEmitter, NativeModules } from 'react-native'
import { AdropChannel, AdropMethod } from '../src/bridge'
import { nativeAdRequestIds } from '../src/contexts/AdropNativeContext'
import { BrowserTarget } from '../src/ads/AdropAd'

jest.mock('../src/utils/id', () => ({
    nanoid: jest.fn(() => 'test_request_id'),
}))

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native')
    RN.NativeModules.AdropAds = {
        initialize: jest.fn(),
    }

    const eventEmitter = {
        addListener: jest.fn(),
        removeListeners: jest.fn(),
        create: jest.fn(),
        load: jest.fn(),
        destroy: jest.fn(),
    }

    RN.NativeModules.EventEmitter = eventEmitter
    RN.NativeModules.AdropNativeAd = eventEmitter

    RN.UIManager.getViewManagerConfig = () => ({})
    return RN
})

const nativeChannel = AdropChannel.nativeEventListenerChannel

const sendEvent = (
    method: string,
    requestId: string = 'test_request_id',
    extra?: Record<string, any>
) => {
    DeviceEventEmitter.emit(nativeChannel, {
        unitId: 'TEST_UNIT_NATIVE',
        method,
        requestId,
        creativeId: '',
        errorCode: '',
        ...extra,
    })
}

describe('AdropNativeAdTest', () => {
    const unitId = 'TEST_UNIT_NATIVE'
    let nativeAd: AdropNativeAd

    beforeEach(() => {
        jest.clearAllMocks()
        nativeAd = new AdropNativeAd(unitId)
    })

    afterEach(() => {
        nativeAd.destroy()
    })

    test('constructor calls native create with unitId, requestId, useCustomClick', () => {
        expect(NativeModules.AdropNativeAd.create).toHaveBeenCalledWith(
            unitId,
            'test_request_id',
            false
        )
    })

    test('nativeAdRequestIds WeakMap registered', () => {
        const getter = nativeAdRequestIds.get(nativeAd)
        expect(getter).toBeDefined()
        expect(getter?.()).toBe('test_request_id')
    })

    test('load() resets isLoaded and calls native load', () => {
        sendEvent(AdropMethod.didReceiveAd)
        expect(nativeAd.isLoaded).toBe(true)

        nativeAd.load()
        expect(nativeAd.isLoaded).toBe(false)
        expect(NativeModules.AdropNativeAd.load).toHaveBeenCalledWith(
            unitId,
            'test_request_id',
            false
        )
    })

    test('didReceiveAd -> isLoaded=true + properties parsed', () => {
        const onAdReceived = jest.fn()
        nativeAd.listener = { onAdReceived }

        sendEvent(AdropMethod.didReceiveAd, 'test_request_id', {
            headline: 'Test Ad',
            body: 'Test body',
            icon: 'https://icon.png',
            cover: 'https://cover.png',
            advertiser: 'TestCorp',
            callToAction: 'Install Now',
            creativeId: 'cr_1',
            txId: 'tx_1',
            campaignId: 'camp_1',
            extra: '{"key":"value"}',
            profileName: 'TestProfile',
            profileLogo: 'https://logo.png',
            isBackfilled: false,
        })

        expect(nativeAd.isLoaded).toBe(true)
        expect(onAdReceived).toHaveBeenCalledWith(nativeAd)

        const props = nativeAd.properties
        expect(props.headline).toBe('Test Ad')
        expect(props.body).toBe('Test body')
        expect(props.icon).toBe('https://icon.png')
        expect(props.cover).toBe('https://cover.png')
        expect(props.advertiser).toBe('TestCorp')
        expect(props.callToAction).toBe('Install Now')
    })

    test('properties getter returns mapped fields', () => {
        sendEvent(AdropMethod.didReceiveAd, 'test_request_id', {
            headline: 'H',
            body: 'B',
            icon: 'I',
            cover: 'C',
            destinationURL: 'https://dest.com',
            advertiserURL: 'https://adv.com',
            accountTag: 'acc',
            creativeTag: 'cre',
            advertiser: 'A',
            callToAction: 'CTA',
            asset: 'asset_url',
            isBackfilled: true,
        })

        const props = nativeAd.properties
        expect(props.destinationURL).toBe('https://dest.com')
        expect(props.advertiserURL).toBe('https://adv.com')
        expect(props.accountTag).toBe('acc')
        expect(props.creativeTag).toBe('cre')
        expect(props.asset).toBe('asset_url')
        expect(props.isBackfilled).toBe(true)
    })

    test('properties.extra parses JSON string', () => {
        sendEvent(AdropMethod.didReceiveAd, 'test_request_id', {
            extra: '{"foo":"bar","num":"42"}',
        })

        const props = nativeAd.properties
        expect(props.extra).toEqual({ foo: 'bar', num: '42' })
    })

    test('properties.profile maps profileName and profileLogo', () => {
        sendEvent(AdropMethod.didReceiveAd, 'test_request_id', {
            profileName: 'MyProfile',
            profileLogo: 'https://logo.png',
        })

        const props = nativeAd.properties
        expect(props.profile?.displayName).toBe('MyProfile')
        expect(props.profile?.displayLogo).toBe('https://logo.png')
    })

    test('didFailToReceiveAd -> errorCode passed', () => {
        const onAdFailedToReceive = jest.fn()
        nativeAd.listener = { onAdFailedToReceive }

        sendEvent(AdropMethod.didFailToReceiveAd, 'test_request_id', {
            errorCode: AdropErrorCode.adNoFill,
        })

        expect(onAdFailedToReceive).toHaveBeenCalledWith(
            nativeAd,
            AdropErrorCode.adNoFill
        )
    })

    test('didClickAd -> listener callback', () => {
        const onAdClicked = jest.fn()
        nativeAd.listener = { onAdClicked }

        sendEvent(AdropMethod.didClickAd)
        expect(onAdClicked).toHaveBeenCalledWith(nativeAd)
    })

    test('didImpression -> listener callback', () => {
        const onAdImpression = jest.fn()
        nativeAd.listener = { onAdImpression }

        sendEvent(AdropMethod.didImpression)
        expect(onAdImpression).toHaveBeenCalledWith(nativeAd)
    })

    test('events with different requestId are ignored', () => {
        const onAdReceived = jest.fn()
        nativeAd.listener = { onAdReceived }

        sendEvent(AdropMethod.didReceiveAd, 'other_request_id')
        expect(onAdReceived).not.toHaveBeenCalled()
        expect(nativeAd.isLoaded).toBe(false)
    })

    test('destroy() calls native destroy + removes from WeakMap', () => {
        nativeAd.destroy()
        expect(NativeModules.AdropNativeAd.destroy).toHaveBeenCalledWith(
            'test_request_id'
        )
        expect(nativeAdRequestIds.has(nativeAd)).toBe(false)
    })

    test('load() with null module calls onAdFailedToReceive (initialize)', () => {
        // Create ad while module exists, then null it to test load() guard
        const ad = new AdropNativeAd(unitId)
        const onAdFailedToReceive = jest.fn()
        ad.listener = { onAdFailedToReceive }

        const originalModule = NativeModules.AdropNativeAd
        NativeModules.AdropNativeAd = undefined as any

        ad.load()
        expect(onAdFailedToReceive).toHaveBeenCalledWith(
            ad,
            AdropErrorCode.initialize
        )

        NativeModules.AdropNativeAd = originalModule
        ad.destroy()
    })

    test('useCustomClick=true returns true from getter', () => {
        const ad = new AdropNativeAd(unitId, true)
        expect(ad.useCustomClick).toBe(true)
        expect(NativeModules.AdropNativeAd.create).toHaveBeenCalledWith(
            unitId,
            'test_request_id',
            true
        )
        ad.destroy()
    })

    test('isBackfilled, isVideoAd, browserTarget properties', () => {
        sendEvent(AdropMethod.didReceiveAd, 'test_request_id', {
            isBackfilled: true,
            isVideoAd: true,
            browserTarget: BrowserTarget.INTERNAL,
        })

        expect(nativeAd.isBackfilled).toBe(true)
        expect(nativeAd.isVideoAd).toBe(true)
        expect(nativeAd.browserTarget).toBe(BrowserTarget.INTERNAL)
    })
})
