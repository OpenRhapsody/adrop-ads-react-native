import AdropPopupAd from '../src/ads/AdropPopupAd'
import { DeviceEventEmitter, NativeModules } from 'react-native'
import { AdropChannel, AdropMethod } from '../src/bridge'
import { AdType } from '../src/ads/AdropAd'

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
        show: jest.fn(),
        destroy: jest.fn(),
        customize: jest.fn(),
        setUseCustomClick: jest.fn(),
        close: jest.fn(),
    }

    RN.NativeModules.EventEmitter = eventEmitter
    RN.NativeModules.AdropPopupAd = eventEmitter

    RN.UIManager.getViewManagerConfig = () => ({})
    return RN
})

const channel = AdropChannel.adropEventListenerChannel(
    AdType.adropPopupAd,
    'test_request_id'
)

const sendEvent = (method: string, extra?: Record<string, any>) => {
    DeviceEventEmitter.emit(channel, {
        unitId: 'TEST_UNIT_POPUP',
        method,
        creativeId: '',
        errorCode: '',
        ...extra,
    })
}

describe('AdropPopupAdTest', () => {
    const unitId = 'TEST_UNIT_POPUP'

    afterEach(() => {
        jest.clearAllMocks()
    })

    test('constructor calls create + customize', () => {
        const ad = new AdropPopupAd(unitId)
        expect(NativeModules.AdropPopupAd.create).toHaveBeenCalledWith(
            unitId,
            'test_request_id'
        )
        expect(NativeModules.AdropPopupAd.customize).toHaveBeenCalledWith(
            'test_request_id',
            {
                closeTextColor: null,
                hideForTodayTextColor: null,
                backgroundColor: null,
            }
        )
        expect(
            NativeModules.AdropPopupAd.setUseCustomClick
        ).toHaveBeenCalledWith('test_request_id', false)
        ad.destroy()
    })

    test('colors option with hex values', () => {
        const ad = new AdropPopupAd(unitId, {
            closeTextColor: '#FF0000',
            hideForTodayTextColor: '#00FF00',
            backgroundColor: '#0000FF',
        })

        expect(NativeModules.AdropPopupAd.customize).toHaveBeenCalledWith(
            'test_request_id',
            {
                closeTextColor: '#FF0000',
                hideForTodayTextColor: '#00FF00',
                backgroundColor: '#0000FF',
            }
        )
        ad.destroy()
    })

    test('colors option with rgb values', () => {
        const ad = new AdropPopupAd(unitId, {
            closeTextColor: 'rgb(255, 0, 0)',
        })

        expect(NativeModules.AdropPopupAd.customize).toHaveBeenCalledWith(
            'test_request_id',
            expect.objectContaining({
                closeTextColor: expect.stringContaining('#'),
            })
        )
        ad.destroy()
    })

    test('colors not provided -> null values', () => {
        const ad = new AdropPopupAd(unitId)
        expect(NativeModules.AdropPopupAd.customize).toHaveBeenCalledWith(
            'test_request_id',
            {
                closeTextColor: null,
                hideForTodayTextColor: null,
                backgroundColor: null,
            }
        )
        ad.destroy()
    })

    test('useCustomClick=true passed to setUseCustomClick', () => {
        const ad = new AdropPopupAd(unitId, undefined, true)
        expect(
            NativeModules.AdropPopupAd.setUseCustomClick
        ).toHaveBeenCalledWith('test_request_id', true)
        ad.destroy()
    })

    test('load() / show() lifecycle', () => {
        const ad = new AdropPopupAd(unitId)
        const onAdReceived = jest.fn()
        const onAdDidPresentFullScreen = jest.fn()
        ad.listener = { onAdReceived, onAdDidPresentFullScreen }

        ad.load()
        expect(NativeModules.AdropPopupAd.load).toHaveBeenCalledWith(
            unitId,
            'test_request_id'
        )

        sendEvent(AdropMethod.didReceiveAd)
        expect(onAdReceived).toHaveBeenCalledWith(ad)

        ad.show()
        expect(NativeModules.AdropPopupAd.show).toHaveBeenCalledWith(
            unitId,
            'test_request_id'
        )

        sendEvent(AdropMethod.didPresentFullScreen)
        expect(onAdDidPresentFullScreen).toHaveBeenCalledWith(ad)
        ad.destroy()
    })

    test('close() calls native close', () => {
        const ad = new AdropPopupAd(unitId)
        ad.close()
        expect(NativeModules.AdropPopupAd.close).toHaveBeenCalledWith(
            'test_request_id'
        )
        ad.destroy()
    })

    test('close() safe when module.close is undefined', () => {
        const originalClose = NativeModules.AdropPopupAd.close
        NativeModules.AdropPopupAd.close = undefined
        const ad = new AdropPopupAd(unitId)
        expect(() => ad.close()).not.toThrow()
        NativeModules.AdropPopupAd.close = originalClose
        ad.destroy()
    })

    test('createIds() deprecated returns empty array', () => {
        const ad = new AdropPopupAd(unitId)
        expect(ad.createIds()).toEqual([])
        ad.destroy()
    })

    test('event handling (didClickAd, didDismissFullScreen)', () => {
        const ad = new AdropPopupAd(unitId)
        const onAdClicked = jest.fn()
        const onAdDidDismissFullScreen = jest.fn()
        ad.listener = { onAdClicked, onAdDidDismissFullScreen }

        sendEvent(AdropMethod.didClickAd)
        expect(onAdClicked).toHaveBeenCalledWith(ad)

        sendEvent(AdropMethod.didDismissFullScreen)
        expect(onAdDidDismissFullScreen).toHaveBeenCalledWith(ad)
        ad.destroy()
    })
})
