import React from 'react'
import { render } from '@testing-library/react-native'
import { AdropNativeContext } from '../../src/contexts/AdropNativeContext'
import AdropHeadLineView from '../../src/views/AdropHeadLineView'
import AdropBodyView from '../../src/views/AdropBodyView'
import AdropCallToActionView from '../../src/views/AdropCallToActionView'
import AdropAdvertiserView from '../../src/views/AdropAdvertiserView'
import AdropProfileNameView from '../../src/views/AdropProfileNameView'

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native')
    RN.findNodeHandle = jest.fn(() => 1)
    return RN
})

const createMockNativeAd = (properties: Record<string, any>) => ({
    properties,
    isLoaded: true,
    unitId: 'test',
    isBackfilled: false,
})

const renderWithContext = (component: React.ReactElement, nativeAd?: any) => {
    const nativeAdView = { setNativeProps: jest.fn() }
    return render(
        <AdropNativeContext.Provider value={{ nativeAd, nativeAdView }}>
            {component}
        </AdropNativeContext.Provider>
    )
}

describe('AdropTextViews', () => {
    describe('AdropHeadLineView', () => {
        test('renders Text when headline content exists', () => {
            const ad = createMockNativeAd({ headline: 'Test Headline' })
            const { getByText } = renderWithContext(<AdropHeadLineView />, ad)
            expect(getByText('Test Headline')).toBeTruthy()
        })

        test('returns null when no headline content', () => {
            const ad = createMockNativeAd({})
            const { toJSON } = renderWithContext(<AdropHeadLineView />, ad)
            expect(toJSON()).toBeNull()
        })
    })

    describe('AdropBodyView', () => {
        test('renders body content', () => {
            const ad = createMockNativeAd({ body: 'Body text here' })
            const { getByText } = renderWithContext(<AdropBodyView />, ad)
            expect(getByText('Body text here')).toBeTruthy()
        })

        test('returns null when no body content', () => {
            const ad = createMockNativeAd({})
            const { toJSON } = renderWithContext(<AdropBodyView />, ad)
            expect(toJSON()).toBeNull()
        })
    })

    describe('AdropCallToActionView', () => {
        test('renders callToAction content', () => {
            const ad = createMockNativeAd({ callToAction: 'Install Now' })
            const { getByText } = renderWithContext(
                <AdropCallToActionView />,
                ad
            )
            expect(getByText('Install Now')).toBeTruthy()
        })

        test('returns null when no callToAction content', () => {
            const ad = createMockNativeAd({})
            const { toJSON } = renderWithContext(<AdropCallToActionView />, ad)
            expect(toJSON()).toBeNull()
        })
    })

    describe('AdropAdvertiserView', () => {
        test('renders advertiser content', () => {
            const ad = createMockNativeAd({ advertiser: 'AdCorp' })
            const { getByText } = renderWithContext(<AdropAdvertiserView />, ad)
            expect(getByText('AdCorp')).toBeTruthy()
        })

        test('returns null when no advertiser content', () => {
            const ad = createMockNativeAd({})
            const { toJSON } = renderWithContext(<AdropAdvertiserView />, ad)
            expect(toJSON()).toBeNull()
        })
    })

    describe('AdropProfileNameView', () => {
        test('renders profile displayName', () => {
            const ad = createMockNativeAd({
                profile: { displayName: 'ProfileUser', displayLogo: '' },
            })
            const { getByText } = renderWithContext(
                <AdropProfileNameView />,
                ad
            )
            expect(getByText('ProfileUser')).toBeTruthy()
        })

        test('returns null when no displayName', () => {
            const ad = createMockNativeAd({
                profile: { displayName: '', displayLogo: '' },
            })
            const { toJSON } = renderWithContext(<AdropProfileNameView />, ad)
            expect(toJSON()).toBeNull()
        })
    })
})
