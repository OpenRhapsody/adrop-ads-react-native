import { renderHook, act } from '@testing-library/react-native'
import useAdropRewardedAd from '../src/hooks/useAdropRewardedAd'
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

describe('useAdropRewardedAd', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    test('unitId provided -> ad created', () => {
        const { result } = renderHook(() => useAdropRewardedAd('TEST_UNIT'))

        expect(result.current.isReady).toBe(true)
        expect(NativeModules.AdropRewardedAd.create).toHaveBeenCalled()
    })

    test('unitId=null -> isReady=false', () => {
        const { result } = renderHook(() => useAdropRewardedAd(null))

        expect(result.current.isReady).toBe(false)
    })

    test('reset() destroys and recreates ad + resets state', () => {
        const { result } = renderHook(() => useAdropRewardedAd('TEST_UNIT'))

        jest.clearAllMocks()

        act(() => {
            result.current.reset()
        })

        expect(NativeModules.AdropRewardedAd.destroy).toHaveBeenCalled()
        expect(NativeModules.AdropRewardedAd.create).toHaveBeenCalled()
    })
})
