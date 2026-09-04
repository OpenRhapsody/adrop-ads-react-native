import React from 'react'
import { render } from '@testing-library/react-native'
import { AdropPreloadedBanner } from '../src'
import type { AdropBannerHandle } from '../src'

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native')
    RN.NativeModules.AdropBanner = {
        loads: jest.fn(),
        destroy: jest.fn(),
        addListener: jest.fn(),
        removeListeners: jest.fn(),
    }
    return RN
})

describe('<AdropPreloadedBanner>', () => {
    const handle: AdropBannerHandle = {
        unitId: 'PUBLIC_TEST_UNIT_ID_320_100',
        requestId: 'preloaded_request_id',
        creativeSize: { width: 320, height: 100 },
    }

    test('renders the native view bound to the handle requestId', () => {
        const tree = render(<AdropPreloadedBanner handle={handle} />)
        const view = tree.UNSAFE_getByType('AdropPreloadedBannerView' as any)
        expect(view.props.requestId).toBe(handle.requestId)
        // Defaults its size to the handle's creativeSize when style is omitted.
        expect(view.props.style).toEqual({ width: 320, height: 100 })
    })

    test('explicit style wins over the creativeSize default', () => {
        const tree = render(
            <AdropPreloadedBanner
                handle={handle}
                style={{ width: 200, height: 50 }}
            />
        )
        const view = tree.UNSAFE_getByType('AdropPreloadedBannerView' as any)
        expect(view.props.style).toEqual({ width: 200, height: 50 })
    })
})
