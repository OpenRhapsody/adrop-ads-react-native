import { renderHook, act } from '@testing-library/react-native'
import useAdropInterstitialAd from '../src/hooks/useAdropInterstitialAd'
import { NativeModules } from 'react-native'

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

describe('useAdropInterstitialAd', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    test('unitId provided -> ad created', () => {
        const { result } = renderHook(() => useAdropInterstitialAd('TEST_UNIT'))

        expect(result.current.isReady).toBe(true)
        expect(NativeModules.AdropInterstitialAd.create).toHaveBeenCalled()
    })

    test('unitId=null -> ad=null, isReady=false', () => {
        const { result } = renderHook(() => useAdropInterstitialAd(null))

        expect(result.current.isReady).toBe(false)
    })

    test('same unitId re-render -> instance reused', () => {
        const { rerender } = renderHook(
            ({ unitId }) => useAdropInterstitialAd(unitId),
            { initialProps: { unitId: 'TEST_UNIT' as string | null } }
        )

        jest.clearAllMocks()
        rerender({ unitId: 'TEST_UNIT' })
        expect(NativeModules.AdropInterstitialAd.create).not.toHaveBeenCalled()
    })

    test('different unitId -> new instance created', () => {
        const { rerender } = renderHook(
            ({ unitId }) => useAdropInterstitialAd(unitId),
            { initialProps: { unitId: 'UNIT_A' as string | null } }
        )

        jest.clearAllMocks()
        rerender({ unitId: 'UNIT_B' })
        expect(NativeModules.AdropInterstitialAd.create).toHaveBeenCalled()
    })

    test('reset() destroys and recreates ad', () => {
        const { result } = renderHook(() => useAdropInterstitialAd('TEST_UNIT'))

        jest.clearAllMocks()

        act(() => {
            result.current.reset()
        })

        expect(NativeModules.AdropInterstitialAd.destroy).toHaveBeenCalled()
        expect(NativeModules.AdropInterstitialAd.create).toHaveBeenCalled()
    })
})
