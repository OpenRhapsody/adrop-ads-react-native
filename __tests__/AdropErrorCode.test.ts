import { AdropErrorCode } from '../src'

describe('AdropErrorCode', () => {
    test('all 14 error codes exist', () => {
        const codes = [
            'network',
            'internal',
            'initialize',
            'invalidUnit',
            'notTargetCountry',
            'inactive',
            'adNoFill',
            'adDuplicated',
            'adLoading',
            'adEmpty',
            'adShown',
            'adHideForToday',
            'adLandscapeUnsupported',
            'backfillNoFill',
        ]

        codes.forEach((code) => {
            expect(
                AdropErrorCode[code as keyof typeof AdropErrorCode]
            ).toBeDefined()
        })
    })

    test('error code string values match', () => {
        expect(AdropErrorCode.network).toBe('ERROR_CODE_NETWORK')
        expect(AdropErrorCode.internal).toBe('ERROR_CODE_INTERNAL')
        expect(AdropErrorCode.initialize).toBe('ERROR_CODE_INITIALIZE')
        expect(AdropErrorCode.invalidUnit).toBe('ERROR_CODE_INVALID_UNIT')
        expect(AdropErrorCode.notTargetCountry).toBe(
            'ERROR_CODE_NOT_TARGET_COUNTRY'
        )
        expect(AdropErrorCode.inactive).toBe('ERROR_CODE_AD_INACTIVE')
        expect(AdropErrorCode.adNoFill).toBe('ERROR_CODE_AD_NO_FILL')
        expect(AdropErrorCode.adDuplicated).toBe(
            'ERROR_CODE_AD_LOAD_DUPLICATED'
        )
        expect(AdropErrorCode.adLoading).toBe('ERROR_CODE_AD_LOADING')
        expect(AdropErrorCode.adEmpty).toBe('ERROR_CODE_AD_EMPTY')
        expect(AdropErrorCode.adShown).toBe('ERROR_CODE_AD_SHOWN')
        expect(AdropErrorCode.adHideForToday).toBe(
            'ERROR_CODE_AD_HIDE_FOR_TODAY'
        )
        expect(AdropErrorCode.adLandscapeUnsupported).toBe(
            'ERROR_CODE_LANDSCAPE_UNSUPPORTED'
        )
        expect(AdropErrorCode.backfillNoFill).toBe(
            'ERROR_CODE_AD_BACKFILL_NO_FILL'
        )
    })
})
