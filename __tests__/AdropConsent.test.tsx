import { AdropConsent } from '../src'
import { AdropConsentStatus } from '../src/consent/AdropConsentStatus'
import { AdropConsentDebugGeography } from '../src/consent/AdropConsentDebugGeography'
import { NativeModules } from 'react-native'

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native')
    RN.NativeModules.AdropConsent = {
        requestConsentInfoUpdate: jest.fn(),
        getConsentStatus: jest.fn(),
        canRequestAds: jest.fn(),
        reset: jest.fn(),
        setDebugSettings: jest.fn(),
    }
    return RN
})

describe('AdropConsent Test', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('requestConsentInfoUpdate returns consent result', async () => {
        const mockResult = {
            status: AdropConsentStatus.OBTAINED,
            canRequestAds: true,
            canShowPersonalizedAds: true,
        }
        NativeModules.AdropConsent.requestConsentInfoUpdate.mockResolvedValue(
            mockResult
        )

        const result = await AdropConsent.requestConsentInfoUpdate()

        expect(
            NativeModules.AdropConsent.requestConsentInfoUpdate
        ).toHaveBeenCalled()
        expect(result.status).toEqual(AdropConsentStatus.OBTAINED)
        expect(result.canRequestAds).toEqual(true)
        expect(result.canShowPersonalizedAds).toEqual(true)
    })

    test('requestConsentInfoUpdate returns result with error', async () => {
        const mockResult = {
            status: AdropConsentStatus.UNKNOWN,
            canRequestAds: false,
            canShowPersonalizedAds: false,
            error: 'Network error',
        }
        NativeModules.AdropConsent.requestConsentInfoUpdate.mockResolvedValue(
            mockResult
        )

        const result = await AdropConsent.requestConsentInfoUpdate()

        expect(result.error).toEqual('Network error')
        expect(result.canRequestAds).toEqual(false)
    })

    test('getConsentStatus returns status value', async () => {
        NativeModules.AdropConsent.getConsentStatus.mockResolvedValue(
            AdropConsentStatus.REQUIRED
        )

        const status = await AdropConsent.getConsentStatus()

        expect(NativeModules.AdropConsent.getConsentStatus).toHaveBeenCalled()
        expect(status).toEqual(AdropConsentStatus.REQUIRED)
    })

    test('canRequestAds returns boolean', async () => {
        NativeModules.AdropConsent.canRequestAds.mockResolvedValue(true)

        const canRequest = await AdropConsent.canRequestAds()

        expect(NativeModules.AdropConsent.canRequestAds).toHaveBeenCalled()
        expect(canRequest).toEqual(true)
    })

    test('canRequestAds returns false when consent not obtained', async () => {
        NativeModules.AdropConsent.canRequestAds.mockResolvedValue(false)

        const canRequest = await AdropConsent.canRequestAds()

        expect(canRequest).toEqual(false)
    })

    test('reset calls native module', () => {
        AdropConsent.reset()

        expect(NativeModules.AdropConsent.reset).toHaveBeenCalled()
    })

    test('setDebugSettings calls native module with geography', () => {
        AdropConsent.setDebugSettings(AdropConsentDebugGeography.EEA)

        expect(
            NativeModules.AdropConsent.setDebugSettings
        ).toHaveBeenCalledWith(AdropConsentDebugGeography.EEA)
    })

    test('setDebugSettings with REGULATED_US_STATE', () => {
        AdropConsent.setDebugSettings(
            AdropConsentDebugGeography.REGULATED_US_STATE
        )

        expect(
            NativeModules.AdropConsent.setDebugSettings
        ).toHaveBeenCalledWith(AdropConsentDebugGeography.REGULATED_US_STATE)
    })

    test('setDebugSettings with DISABLED', () => {
        AdropConsent.setDebugSettings(AdropConsentDebugGeography.DISABLED)

        expect(
            NativeModules.AdropConsent.setDebugSettings
        ).toHaveBeenCalledWith(AdropConsentDebugGeography.DISABLED)
    })
})
