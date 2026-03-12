import { AdropRewardedAd, AdropErrorCode } from '../src'
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
    }

    RN.NativeModules.EventEmitter = eventEmitter
    RN.NativeModules.AdropRewardedAd = eventEmitter

    RN.UIManager.getViewManagerConfig = () => ({})
    return RN
})

const channel = AdropChannel.adropEventListenerChannel(
    AdType.adropRewardedAd,
    'test_request_id'
)

const sendEvent = (method: string, extra?: Record<string, any>) => {
    DeviceEventEmitter.emit(channel, {
        unitId: 'TEST_UNIT_REWARDED',
        method,
        creativeId: '',
        errorCode: '',
        ...extra,
    })
}

describe('AdropRewardedAdTest', () => {
    const unitId = 'TEST_UNIT_REWARDED'
    let rewardedAd: AdropRewardedAd

    beforeEach(() => {
        jest.clearAllMocks()
        rewardedAd = new AdropRewardedAd(unitId)
    })

    afterEach(() => {
        rewardedAd.destroy()
    })

    test('constructor calls native create', () => {
        expect(NativeModules.AdropRewardedAd.create).toHaveBeenCalledWith(
            unitId,
            'test_request_id'
        )
    })

    test('load() -> didReceiveAd -> isLoaded=true', () => {
        const onAdReceived = jest.fn()
        rewardedAd.listener = { onAdReceived }

        rewardedAd.load()
        expect(NativeModules.AdropRewardedAd.load).toHaveBeenCalledWith(
            unitId,
            'test_request_id'
        )

        sendEvent(AdropMethod.didReceiveAd)
        expect(rewardedAd.isLoaded).toBe(true)
        expect(onAdReceived).toHaveBeenCalledWith(rewardedAd)
    })

    test('show() -> didPresentFullScreen', () => {
        const onAdDidPresentFullScreen = jest.fn()
        rewardedAd.listener = { onAdDidPresentFullScreen }

        rewardedAd.show()
        expect(NativeModules.AdropRewardedAd.show).toHaveBeenCalledWith(
            unitId,
            'test_request_id'
        )

        sendEvent(AdropMethod.didPresentFullScreen)
        expect(onAdDidPresentFullScreen).toHaveBeenCalledWith(rewardedAd)
    })

    test('handleEarnReward event -> listener callback (type, amount)', () => {
        const onAdEarnRewardHandler = jest.fn()
        rewardedAd.listener = { onAdEarnRewardHandler }

        sendEvent(AdropMethod.handleEarnReward, { type: 1, amount: 100 })
        expect(onAdEarnRewardHandler).toHaveBeenCalledWith(rewardedAd, 1, 100)
    })

    test('filter events of different requestId (channel-based)', () => {
        const onAdReceived = jest.fn()
        rewardedAd.listener = { onAdReceived }

        DeviceEventEmitter.emit(
            AdropChannel.adropEventListenerChannel(
                AdType.adropRewardedAd,
                'different_request_id'
            ),
            { unitId, method: AdropMethod.didReceiveAd }
        )

        expect(onAdReceived).not.toHaveBeenCalled()
    })

    test('load failure -> didFailToReceiveAd (initialize)', () => {
        const onAdFailedToReceive = jest.fn()
        rewardedAd.listener = { onAdFailedToReceive }

        rewardedAd.load()
        sendEvent(AdropMethod.didFailToReceiveAd, {
            errorCode: AdropErrorCode.initialize,
        })

        expect(onAdFailedToReceive).toHaveBeenCalledWith(
            rewardedAd,
            AdropErrorCode.initialize
        )
    })

    test('load failure -> didFailToReceiveAd (adNoFill)', () => {
        const onAdFailedToReceive = jest.fn()
        rewardedAd.listener = { onAdFailedToReceive }

        rewardedAd.load()
        sendEvent(AdropMethod.didFailToReceiveAd, {
            errorCode: AdropErrorCode.adNoFill,
        })

        expect(onAdFailedToReceive).toHaveBeenCalledWith(
            rewardedAd,
            AdropErrorCode.adNoFill
        )
    })

    test('show before load -> adEmpty error via native', () => {
        const onAdFailedToShowFullScreen = jest.fn()
        rewardedAd.listener = { onAdFailedToShowFullScreen }

        rewardedAd.show()
        sendEvent(AdropMethod.didFailToShowFullScreen, {
            errorCode: AdropErrorCode.adEmpty,
        })

        expect(onAdFailedToShowFullScreen).toHaveBeenCalledWith(
            rewardedAd,
            AdropErrorCode.adEmpty
        )
    })

    test('destroy() calls native destroy', () => {
        rewardedAd.destroy()
        expect(NativeModules.AdropRewardedAd.destroy).toHaveBeenCalledWith(
            'test_request_id'
        )
    })

    test('creativeId, txId, campaignId updated on event', () => {
        sendEvent(AdropMethod.didReceiveAd, {
            creativeId: 'cr_123',
            txId: 'tx_456',
            campaignId: 'camp_789',
            destinationURL: 'https://example.com',
            browserTarget: 1,
        })

        expect(rewardedAd.creativeId).toBe('cr_123')
        expect(rewardedAd.txId).toBe('tx_456')
        expect(rewardedAd.campaignId).toBe('camp_789')
        expect(rewardedAd.destinationURL).toBe('https://example.com')
        expect(rewardedAd.browserTarget).toBe(1)
    })
})
