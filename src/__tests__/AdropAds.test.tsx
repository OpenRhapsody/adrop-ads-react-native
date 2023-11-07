import { Adrop } from '../index'

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native')
    RN.NativeModules.AdropAds = {
        initialize: jest.fn(),
    }

    // mock modules created through UIManager
    RN.UIManager.getViewManagerConfig = (name: string) => {
        if (name === 'AdropAds') {
            return { initialize: jest.fn() }
        }
        return {}
    }
    return RN
})

describe('Adrop Test', () => {
    test('initialize production', () => {
        Adrop.initialize(true)
    })
})
