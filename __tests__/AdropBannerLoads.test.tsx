import { DeviceEventEmitter } from 'react-native'
import { AdropBanner } from '../src'
import { AdropChannel } from '../src/bridge'

const mockLoads = jest.fn()
const mockDestroy = jest.fn()

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native')
    RN.NativeModules.AdropBanner = {
        loads: (...args: any[]) => mockLoads(...args),
        destroy: (...args: any[]) => mockDestroy(...args),
        addListener: jest.fn(),
        removeListeners: jest.fn(),
    }
    return RN
})

const metadataFor = (unitId: string, requestId: string) => ({
    unitId,
    requestId,
    creativeId: `creative_${requestId}`,
    txId: `tx_${requestId}`,
    campaignId: `campaign_${requestId}`,
    destinationURL: `https://example.com/${requestId}`,
    creativeSizeWidth: 320,
    creativeSizeHeight: 100,
    browserTarget: 0,
    creativeType: 'display',
})

describe('AdropBanner.loads', () => {
    const unitId = 'PUBLIC_TEST_UNIT_ID_320_100'

    beforeEach(() => {
        mockLoads.mockReset()
        mockDestroy.mockReset()
    })

    test('sends unitId, 5 distinct requestIds and resolves handles', async () => {
        mockLoads.mockImplementation(
            async (_unitId: string, requestIds: string[]) => ({
                requestIds: requestIds.slice(0, 3),
                ads: requestIds
                    .slice(0, 3)
                    .map((id) => metadataFor(_unitId, id)),
            })
        )

        const handles = await AdropBanner.loads({ unitId })

        expect(mockLoads).toHaveBeenCalledTimes(1)
        const [sentUnitId, sentIds, sentUseCustomClick] = mockLoads.mock
            .calls[0] as [string, string[], boolean]
        expect(sentUnitId).toBe(unitId)
        expect(sentIds).toHaveLength(5)
        expect(new Set(sentIds).size).toBe(5)
        expect(sentUseCustomClick).toBe(false)

        expect(handles).toHaveLength(3)
        handles.forEach((handle) => {
            expect(handle.unitId).toBe(unitId)
            expect(sentIds).toContain(handle.requestId)
            expect(handle.creativeSize).toEqual({ width: 320, height: 100 })
        })
    })

    test('treats a 0×0 creativeSize from native as unknown', async () => {
        mockLoads.mockImplementation(
            async (_unitId: string, requestIds: string[]) => ({
                requestIds: requestIds.slice(0, 1),
                ads: [
                    {
                        ...metadataFor(_unitId, requestIds[0]!),
                        creativeSizeWidth: 0,
                        creativeSizeHeight: 0,
                    },
                ],
            })
        )

        const [handle] = await AdropBanner.loads({ unitId })

        expect(handle?.creativeSize).toBeUndefined()
    })

    test('rejects with the AdropErrorCode name on failure', async () => {
        mockLoads.mockRejectedValue({
            code: 'ERROR_CODE_AD_NO_FILL',
            message: 'AdropBanner.loads failed',
        })

        await expect(AdropBanner.loads({ unitId })).rejects.toMatchObject({
            code: 'ERROR_CODE_AD_NO_FILL',
        })
    })

    test('routes events to the shared listener by requestId', async () => {
        mockLoads.mockImplementation(
            async (_unitId: string, requestIds: string[]) => ({
                requestIds: requestIds.slice(0, 2),
                ads: requestIds
                    .slice(0, 2)
                    .map((id) => metadataFor(_unitId, id)),
            })
        )

        const clicked: string[] = []
        const impressed: string[] = []
        const handles = await AdropBanner.loads({
            unitId,
            listener: {
                onAdClicked: (_u, requestId, metadata) => {
                    clicked.push(requestId)
                    expect(metadata?.creativeId).toBe(`creative_${requestId}`)
                },
                onAdImpression: (_u, requestId) => impressed.push(requestId),
            },
        })

        const first = handles[0]!
        const second = handles[1]!
        DeviceEventEmitter.emit(AdropChannel.preloadedBannerEventChannel, {
            method: 'onAdClicked',
            ...metadataFor(unitId, first.requestId),
        })
        DeviceEventEmitter.emit(AdropChannel.preloadedBannerEventChannel, {
            method: 'onAdImpression',
            ...metadataFor(unitId, second.requestId),
        })

        expect(clicked).toEqual([first.requestId])
        expect(impressed).toEqual([second.requestId])
    })

    test('destroyLoaded stops routing and calls native destroy', async () => {
        mockLoads.mockImplementation(
            async (_unitId: string, requestIds: string[]) => ({
                requestIds: requestIds.slice(0, 1),
                ads: requestIds
                    .slice(0, 1)
                    .map((id) => metadataFor(_unitId, id)),
            })
        )

        const clicked: string[] = []
        const handles = await AdropBanner.loads({
            unitId,
            listener: {
                onAdClicked: (_u, requestId) => clicked.push(requestId),
            },
        })

        const handle = handles[0]!
        AdropBanner.destroyLoaded(handle)
        expect(mockDestroy).toHaveBeenCalledWith(handle.requestId)

        DeviceEventEmitter.emit(AdropChannel.preloadedBannerEventChannel, {
            method: 'onAdClicked',
            ...metadataFor(unitId, handle.requestId),
        })
        expect(clicked).toEqual([])
    })
})
