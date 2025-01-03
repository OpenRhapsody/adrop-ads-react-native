import { AdropMetrics } from '../src'
import { NativeModules } from 'react-native'

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native')
    RN.NativeModules.AdropMetrics = {
        properties: jest.fn(),
    }
    return RN
})

describe('AdropMetrics Test', () => {
    test('properties', async () => {
        const mockResponse = { key1: 'value1', key2: 123, key3: true, key4: 0 }
        NativeModules.AdropMetrics.properties.mockResolvedValue(mockResponse)

        const res: Record<string, any> = await AdropMetrics.properties()
        expect(res).toBeInstanceOf(Object)
        expect(res.key1).toEqual('value1')
        expect(res.key2).toEqual(123)
        expect(res.key3).toEqual(true)
        expect(res.key4).toEqual(0)
    })
})
