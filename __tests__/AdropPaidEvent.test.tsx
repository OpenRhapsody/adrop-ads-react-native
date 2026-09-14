import { AdropInterstitialAd } from '../src'
import { DeviceEventEmitter, NativeModules } from 'react-native'
import { AdropChannel, AdropMethod } from '../src/bridge'
import { AdType } from '../src/ads/AdropAd'
import type { AdropAdValue } from '../src/ads/AdropAdValue'

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native')
    RN.NativeModules.AdropInterstitialAd = {
        create: jest.fn(),
        load: jest.fn(),
        show: jest.fn(),
        destroy: jest.fn(),
    }
    return RN
})

/**
 * The paid-event payload crosses two independently written native bridges, so the
 * failure mode is a key or spelling that differs on only one platform — the callback
 * then never fires, or fires with an unusable value.
 */
describe('onPaidEvent routing', () => {
    const unitId = 'PAID_EVENT_TEST_UNIT'

    const paidValue: AdropAdValue = {
        network: 'admob',
        adSourceName: 'AppLovin',
        valueMicros: 5000,
        currencyCode: 'USD',
        precision: 'precise',
    }

    const createAdAndChannel = () => {
        const ad = new AdropInterstitialAd(unitId)
        const requestId =
            NativeModules.AdropInterstitialAd.create.mock.calls.slice(-1)[0][1]
        const channel = AdropChannel.adropEventListenerChannel(
            AdType.adropInterstitialAd,
            requestId
        )
        const emitEvent = (method: string, extra?: Record<string, any>) => {
            DeviceEventEmitter.emit(channel, { unitId, method, ...extra })
        }
        return { ad, emitEvent }
    }

    afterEach(() => {
        jest.clearAllMocks()
    })

    test('delivers the value together with the ad that earned it', () => {
        const { ad, emitEvent } = createAdAndChannel()
        const onPaidEvent = jest.fn()
        ad.listener = { onPaidEvent }

        emitEvent(AdropMethod.didPaidEvent, { value: paidValue })

        expect(onPaidEvent).toHaveBeenCalledTimes(1)
        expect(onPaidEvent).toHaveBeenCalledWith(ad, paidValue)
    })

    test('a paid event does not blank out the ad metadata', () => {
        const { ad, emitEvent } = createAdAndChannel()
        ad.listener = {}

        const metadata = {
            creativeId: 'creative-1',
            txId: 'backfill_tx-1',
            campaignId: 'campaign-1',
        }
        emitEvent(AdropMethod.didReceiveAd, metadata)
        expect(ad.txId).toBe('backfill_tx-1')

        // The native bridges send the same metadata with the paid event, so the ad's
        // identity survives; sending only `value` would reset these to empty strings.
        emitEvent(AdropMethod.didPaidEvent, { ...metadata, value: paidValue })

        expect(ad.txId).toBe('backfill_tx-1')
        expect(ad.creativeId).toBe('creative-1')
        expect(ad.campaignId).toBe('campaign-1')
    })

    test('ignores a paid event that carries no value', () => {
        const { ad, emitEvent } = createAdAndChannel()
        const onPaidEvent = jest.fn()
        ad.listener = { onPaidEvent }

        emitEvent(AdropMethod.didPaidEvent)

        expect(onPaidEvent).not.toHaveBeenCalled()
    })
})
