import React from 'react'
import { render } from '@testing-library/react-native'
import { AdropNativeContext } from '../../src/contexts/AdropNativeContext'
import AdropIconView from '../../src/views/AdropIconView'
import AdropProfileLogoView from '../../src/views/AdropProfileLogoView'

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

describe('AdropImageViews', () => {
    describe('AdropIconView', () => {
        test('renders Image when icon src exists', () => {
            const ad = createMockNativeAd({ icon: 'https://icon.png' })
            const { toJSON } = renderWithContext(<AdropIconView />, ad)
            const tree = toJSON()
            expect(tree).not.toBeNull()
        })

        test('returns null when no icon src', () => {
            const ad = createMockNativeAd({})
            const { toJSON } = renderWithContext(<AdropIconView />, ad)
            expect(toJSON()).toBeNull()
        })
    })

    describe('AdropProfileLogoView', () => {
        test('renders Image when displayLogo exists', () => {
            const ad = createMockNativeAd({
                profile: {
                    displayName: 'Test',
                    displayLogo: 'https://logo.png',
                },
            })
            const { toJSON } = renderWithContext(<AdropProfileLogoView />, ad)
            expect(toJSON()).not.toBeNull()
        })

        test('returns null when no displayLogo', () => {
            const ad = createMockNativeAd({
                profile: { displayName: 'Test', displayLogo: '' },
            })
            const { toJSON } = renderWithContext(<AdropProfileLogoView />, ad)
            expect(toJSON()).toBeNull()
        })
    })
})
