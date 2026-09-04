import { DeviceEventEmitter } from 'react-native'
import { AdropNativeAd } from '../src'
import { AdropChannel } from '../src/bridge'

const mockLoads = jest.fn()
const mockDestroy = jest.fn()

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native')
    const emitterStub = {
        addListener: jest.fn(),
        removeListeners: jest.fn(),
    }
    RN.NativeModules.AdropNativeAd = {
        ...emitterStub,
        create: jest.fn(),
        load: jest.fn(),
        loads: (...args: any[]) => mockLoads(...args),
        destroy: (...args: any[]) => mockDestroy(...args),
    }
    RN.NativeModules.EventEmitter = emitterStub
    return RN
})

const metadataFor = (unitId: string, requestId: string) => ({
    unitId,
    requestId,
    creativeId: `creative_${requestId}`,
    txId: `tx_${requestId}`,
    campaignId: `campaign_${requestId}`,
    headline: `Headline ${requestId}`,
    body: `Body ${requestId}`,
    destinationURL: `https://example.com/${requestId}`,
    creative: 'https://example.com/creative.html',
    profileName: 'Advertiser',
    profileLogo: 'https://example.com/logo.png',
    extra: '{"key":"value"}',
    asset: 'https://example.com/asset.png',
    callToAction: 'Install',
    isBackfilled: false,
    isVideoAd: false,
    browserTarget: 0,
    creativeType: 'display',
})

describe('AdropNativeAd.loads', () => {
    const unitId = 'PUBLIC_TEST_UNIT_ID_NATIVE'

    beforeEach(() => {
        mockLoads.mockReset()
        mockDestroy.mockReset()
    })

    test('sends unitId, 5 distinct requestIds, useCustomClick', async () => {
        mockLoads.mockResolvedValue({ requestIds: [], ads: [] })

        const ads = await AdropNativeAd.loads({ unitId, useCustomClick: true })
        expect(ads).toEqual([])

        const [sentUnitId, sentIds, sentUseCustomClick] = mockLoads.mock
            .calls[0] as [string, string[], boolean]
        expect(sentUnitId).toBe(unitId)
        expect(sentIds).toHaveLength(5)
        expect(new Set(sentIds).size).toBe(5)
        expect(sentUseCustomClick).toBe(true)
    })

    test('resolves fully-hydrated instances without didReceiveAd', async () => {
        mockLoads.mockImplementation(
            async (_unitId: string, requestIds: string[]) => ({
                requestIds: requestIds.slice(0, 3),
                ads: requestIds
                    .slice(0, 3)
                    .map((id) => metadataFor(_unitId, id)),
            })
        )

        const received: string[] = []
        const ads = await AdropNativeAd.loads({
            unitId,
            listener: {
                onAdReceived: () => received.push('received'),
            },
        })

        expect(ads).toHaveLength(3)
        for (const ad of ads) {
            expect(ad.isLoaded).toBe(true)
            expect(ad.unitId).toBe(unitId)
            expect(ad.creativeId).toMatch(/^creative_/)
            expect(ad.txId).toMatch(/^tx_/)
            expect(ad.isBackfilled).toBe(false)
            expect(ad.properties.headline).toMatch(/^Headline /)
            expect(ad.properties.body).toMatch(/^Body /)
            expect(ad.properties.extra?.key).toBe('value')
            expect(ad.properties.profile?.displayName).toBe('Advertiser')
        }
        // The singular onAdReceived must not re-fire on the batch path.
        expect(received).toEqual([])
    })

    test('rejects with the AdropErrorCode name on failure', async () => {
        mockLoads.mockRejectedValue({
            code: 'ERROR_CODE_AD_NO_FILL',
            message: 'AdropNativeAd.loads failed',
        })

        await expect(AdropNativeAd.loads({ unitId })).rejects.toMatchObject({
            code: 'ERROR_CODE_AD_NO_FILL',
        })
    })

    test('per-instance events route to the right batch instance', async () => {
        mockLoads.mockImplementation(
            async (_unitId: string, requestIds: string[]) => ({
                requestIds: requestIds.slice(0, 3),
                ads: requestIds
                    .slice(0, 3)
                    .map((id) => metadataFor(_unitId, id)),
            })
        )

        const clicked: AdropNativeAd[] = []
        const ads = await AdropNativeAd.loads({
            unitId,
            listener: {
                onAdClicked: (ad) => clicked.push(ad),
            },
        })

        const [sentIds] = [mockLoads.mock.calls[0]![1] as string[]]
        const target = ads[1]!
        DeviceEventEmitter.emit(AdropChannel.nativeEventListenerChannel, {
            method: 'onAdClicked',
            ...metadataFor(unitId, sentIds[1]!),
        })

        expect(clicked).toHaveLength(1)
        expect(clicked[0]).toBe(target)
    })

    test('destroy calls native destroy with the batch requestId', async () => {
        mockLoads.mockImplementation(
            async (_unitId: string, requestIds: string[]) => ({
                requestIds: requestIds.slice(0, 1),
                ads: requestIds
                    .slice(0, 1)
                    .map((id) => metadataFor(_unitId, id)),
            })
        )

        const ads = await AdropNativeAd.loads({ unitId })
        ads[0]!.destroy()

        const sentIds = mockLoads.mock.calls[0]![1] as string[]
        expect(mockDestroy).toHaveBeenCalledWith(sentIds[0])
    })
})
