import { renderHook, act } from '@testing-library/react-native'
import useAdropFullScreenAd from '../src/hooks/useAdropFullScreenAd'
import { AdropInterstitialAd } from '../src/ads'
import { DeviceEventEmitter, NativeModules } from 'react-native'
import { AdropChannel, AdropMethod } from '../src/bridge'
import { AdType } from '../src/ads/AdropAd'

jest.mock('../src/utils/id', () => ({
    nanoid: jest.fn(() => 'hook_request_id'),
}))

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native')
    RN.NativeModules.AdropAds = { initialize: jest.fn() }

    const eventEmitter = {
        addListener: jest.fn(),
        removeListeners: jest.fn(),
        create: jest.fn(),
        load: jest.fn(),
        show: jest.fn(),
        destroy: jest.fn(),
    }

    RN.NativeModules.EventEmitter = eventEmitter
    RN.NativeModules.AdropInterstitialAd = eventEmitter
    RN.NativeModules.AdropRewardedAd = eventEmitter

    RN.UIManager.getViewManagerConfig = () => ({})
    return RN
})

const channel = AdropChannel.adropEventListenerChannel(
    AdType.adropInterstitialAd,
    'hook_request_id'
)

const sendEvent = (method: string, extra?: Record<string, any>) => {
    DeviceEventEmitter.emit(channel, {
        unitId: 'TEST_UNIT',
        method,
        creativeId: '',
        errorCode: '',
        ...extra,
    })
}

describe('useAdropFullScreenAd', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    test('ad=null -> initial state (all boolean false)', () => {
        const { result } = renderHook(() => useAdropFullScreenAd(null))

        expect(result.current.isReady).toBe(false)
        expect(result.current.isLoaded).toBe(false)
        expect(result.current.isOpened).toBe(false)
        expect(result.current.isClosed).toBe(false)
        expect(result.current.isClicked).toBe(false)
        expect(result.current.isEarnRewarded).toBe(false)
        expect(result.current.errorCode).toBeUndefined()
    })

    test('ad instance -> isReady=true', () => {
        const ad = new AdropInterstitialAd('TEST_UNIT')
        const { result } = renderHook(() => useAdropFullScreenAd(ad))

        expect(result.current.isReady).toBe(true)
    })

    test('load() calls ad.load()', () => {
        const ad = new AdropInterstitialAd('TEST_UNIT')
        const { result } = renderHook(() => useAdropFullScreenAd(ad))

        act(() => {
            result.current.load()
        })

        expect(NativeModules.AdropInterstitialAd.load).toHaveBeenCalled()
    })

    test('isReady=false -> load() does not call ad.load()', () => {
        const { result } = renderHook(() => useAdropFullScreenAd(null))

        act(() => {
            result.current.load()
        })

        expect(NativeModules.AdropInterstitialAd.load).not.toHaveBeenCalled()
    })

    test('onAdReceived -> isLoaded=true', () => {
        const ad = new AdropInterstitialAd('TEST_UNIT')
        const { result } = renderHook(() => useAdropFullScreenAd(ad))

        act(() => {
            sendEvent(AdropMethod.didReceiveAd)
        })

        expect(result.current.isLoaded).toBe(true)
    })

    test('onAdFailedToReceive -> errorCode set', () => {
        const ad = new AdropInterstitialAd('TEST_UNIT')
        const { result } = renderHook(() => useAdropFullScreenAd(ad))

        act(() => {
            sendEvent(AdropMethod.didFailToReceiveAd, {
                errorCode: 'ERROR_CODE_AD_NO_FILL',
            })
        })

        expect(result.current.errorCode).toBe('ERROR_CODE_AD_NO_FILL')
    })

    test('onAdDidPresentFullScreen -> isOpened=true', () => {
        const ad = new AdropInterstitialAd('TEST_UNIT')
        const { result } = renderHook(() => useAdropFullScreenAd(ad))

        act(() => {
            sendEvent(AdropMethod.didPresentFullScreen)
        })

        expect(result.current.isOpened).toBe(true)
    })

    test('onAdDidDismissFullScreen -> isClosed=true', () => {
        const ad = new AdropInterstitialAd('TEST_UNIT')
        const { result } = renderHook(() => useAdropFullScreenAd(ad))

        act(() => {
            sendEvent(AdropMethod.didDismissFullScreen)
        })

        expect(result.current.isClosed).toBe(true)
    })

    test('onAdEarnRewardHandler -> isEarnRewarded=true + reward', () => {
        const ad = new AdropInterstitialAd('TEST_UNIT')
        const { result } = renderHook(() => useAdropFullScreenAd(ad))

        act(() => {
            sendEvent(AdropMethod.handleEarnReward, { type: 1, amount: 50 })
        })

        expect(result.current.isEarnRewarded).toBe(true)
        expect(result.current.reward).toEqual({ type: 1, amount: 50 })
    })

    test('onAdClicked -> isClicked=true', () => {
        const ad = new AdropInterstitialAd('TEST_UNIT')
        const { result } = renderHook(() => useAdropFullScreenAd(ad))

        act(() => {
            sendEvent(AdropMethod.didClickAd)
        })

        expect(result.current.isClicked).toBe(true)
    })

    test('onAdFailedToShowFullScreen -> errorCode set', () => {
        const ad = new AdropInterstitialAd('TEST_UNIT')
        const { result } = renderHook(() => useAdropFullScreenAd(ad))

        act(() => {
            sendEvent(AdropMethod.didFailToShowFullScreen, {
                errorCode: 'ERROR_CODE_AD_EMPTY',
            })
        })

        expect(result.current.errorCode).toBe('ERROR_CODE_AD_EMPTY')
    })

    test('reset() resets all states', () => {
        const ad = new AdropInterstitialAd('TEST_UNIT')
        const { result } = renderHook(() => useAdropFullScreenAd(ad))

        act(() => {
            sendEvent(AdropMethod.didReceiveAd)
        })
        expect(result.current.isLoaded).toBe(true)

        act(() => {
            result.current.reset()
        })

        expect(result.current.isLoaded).toBe(false)
        expect(result.current.isClicked).toBe(false)
        expect(result.current.isClosed).toBe(false)
        expect(result.current.isOpened).toBe(false)
        expect(result.current.isEarnRewarded).toBe(false)
    })

    test('ad change triggers cleanup (destroy)', () => {
        const ad1 = new AdropInterstitialAd('TEST_UNIT')
        jest.clearAllMocks()

        const { rerender } = renderHook(({ ad }) => useAdropFullScreenAd(ad), {
            initialProps: { ad: ad1 as AdropInterstitialAd | null },
        })

        rerender({ ad: null })
        expect(NativeModules.AdropInterstitialAd.destroy).toHaveBeenCalled()
    })

    test('show() calls ad.show()', () => {
        const ad = new AdropInterstitialAd('TEST_UNIT')
        const { result } = renderHook(() => useAdropFullScreenAd(ad))

        act(() => {
            result.current.show()
        })

        expect(NativeModules.AdropInterstitialAd.show).toHaveBeenCalled()
    })
})
