import { renderHook, act } from '@testing-library/react-native'
import { NativeModules } from 'react-native'
import useAdropWebView from '../src/hooks/useAdropWebView'

const mockFindNodeHandle = jest.fn()

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native')
    RN.NativeModules.AdropAds = {
        initialize: jest.fn(),
        registerWebView: jest.fn().mockResolvedValue(undefined),
    }

    const eventEmitter = {
        addListener: jest.fn(),
        removeListeners: jest.fn(),
    }

    RN.NativeModules.EventEmitter = eventEmitter
    RN.NativeModules.AdropInterstitialAd = eventEmitter
    RN.NativeModules.AdropRewardedAd = eventEmitter

    RN.UIManager.getViewManagerConfig = () => ({})

    // findNodeHandle is a getter-based export, so use defineProperty
    Object.defineProperty(RN, 'findNodeHandle', {
        get: () => mockFindNodeHandle,
        configurable: true,
    })
    return RN
})

describe('useAdropWebView', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    test('initial state: isReady is false', () => {
        const { result } = renderHook(() => useAdropWebView())

        expect(result.current.isReady).toBe(false)
        expect(result.current.containerRef).toBeDefined()
        expect(result.current.onLayout).toBeDefined()
    })

    test('onLayout with null findNodeHandle does not register', () => {
        mockFindNodeHandle.mockReturnValue(null)

        const { result } = renderHook(() => useAdropWebView())
        ;(result.current.containerRef as any).current = {}

        act(() => {
            result.current.onLayout()
        })

        expect(NativeModules.AdropAds.registerWebView).not.toHaveBeenCalled()
        expect(result.current.isReady).toBe(false)
    })

    test('onLayout with valid tag calls registerWebView and sets isReady', async () => {
        mockFindNodeHandle.mockReturnValue(42)

        const { result } = renderHook(() => useAdropWebView())
        ;(result.current.containerRef as any).current = {}

        await act(async () => {
            await result.current.onLayout()
        })

        expect(NativeModules.AdropAds.registerWebView).toHaveBeenCalledWith(42)
        expect(result.current.isReady).toBe(true)
    })

    test('duplicate onLayout calls do not re-register', async () => {
        mockFindNodeHandle.mockReturnValue(42)

        const { result } = renderHook(() => useAdropWebView())
        ;(result.current.containerRef as any).current = {}

        await act(async () => {
            await result.current.onLayout()
        })

        await act(async () => {
            await result.current.onLayout()
        })

        expect(NativeModules.AdropAds.registerWebView).toHaveBeenCalledTimes(1)
    })

    test('onLayout without containerRef.current does not register', () => {
        mockFindNodeHandle.mockReturnValue(42)

        const { result } = renderHook(() => useAdropWebView())
        // containerRef.current is null by default

        act(() => {
            result.current.onLayout()
        })

        expect(NativeModules.AdropAds.registerWebView).not.toHaveBeenCalled()
        expect(result.current.isReady).toBe(false)
    })
})
