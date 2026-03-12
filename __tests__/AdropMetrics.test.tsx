import { AdropMetrics } from '../src'
import { NativeModules } from 'react-native'

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native')
    RN.NativeModules.AdropMetrics = {
        properties: jest.fn(),
        setProperty: jest.fn(),
        sendEvent: jest.fn(),
    }
    return RN
})

describe('AdropMetrics Test', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    test('properties returns correct object', async () => {
        const mockResponse = { key1: 'value1', key2: 123, key3: true, key4: 0 }
        NativeModules.AdropMetrics.properties.mockResolvedValue(mockResponse)

        const res: Record<string, any> = await AdropMetrics.properties()
        expect(res).toBeInstanceOf(Object)
        expect(res.key1).toEqual('value1')
        expect(res.key2).toEqual(123)
        expect(res.key3).toEqual(true)
        expect(res.key4).toEqual(0)
    })

    test('setProperty calls native with key and [value]', () => {
        AdropMetrics.setProperty('AGE', 25)
        expect(NativeModules.AdropMetrics.setProperty).toHaveBeenCalledWith(
            'AGE',
            [25]
        )
    })

    test('logEvent calls native sendEvent with name and params', () => {
        AdropMetrics.logEvent('purchase', { amount: 100 })
        expect(NativeModules.AdropMetrics.sendEvent).toHaveBeenCalledWith(
            'purchase',
            { amount: 100 }
        )
    })

    test('logEvent without params calls native sendEvent with null', () => {
        AdropMetrics.logEvent('view')
        expect(NativeModules.AdropMetrics.sendEvent).toHaveBeenCalledWith(
            'view',
            null
        )
    })

    test('properties returns empty object when array is returned', async () => {
        NativeModules.AdropMetrics.properties.mockResolvedValue([1, 2, 3])
        const res = await AdropMetrics.properties()
        expect(res).toEqual({})
    })

    test('properties returns empty object when null is returned', async () => {
        NativeModules.AdropMetrics.properties.mockResolvedValue(null)
        const res = await AdropMetrics.properties()
        expect(res).toEqual({})
    })
})
