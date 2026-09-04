import React from 'react'
import {
    requireNativeComponent,
    type StyleProp,
    type ViewStyle,
} from 'react-native'

import type { AdropBannerHandle } from './AdropBannerLoads'

type AdropPreloadedBannerNativeProp = {
    requestId: string
    style?: StyleProp<ViewStyle>
}

export type AdropPreloadedBannerProp = {
    /** Issued by `AdropBanner.loads()` — identifies the pre-loaded banner. */
    handle: AdropBannerHandle
    style?: StyleProp<ViewStyle>
}

const ComponentName = 'AdropPreloadedBannerView'

const PreloadedBannerView =
    requireNativeComponent<AdropPreloadedBannerNativeProp>(ComponentName)

/**
 * Mounts a banner pre-loaded by `AdropBanner.loads()`. Re-attachable:
 * unmounting (e.g. FlatList recycling) only detaches the native view and a
 * later mount re-binds it. Event callbacks are configured on `loads()` — this
 * component intentionally takes no options (single source of truth).
 *
 * Defaults its size to the handle's creativeSize when `style` is omitted.
 * Release the native banner with `AdropBanner.destroyLoaded(handle)`.
 */
const AdropPreloadedBanner = ({ handle, style }: AdropPreloadedBannerProp) => {
    const defaultStyle =
        style ??
        ({
            width: handle.creativeSize?.width ?? '100%',
            height: handle.creativeSize?.height ?? 80,
        } as StyleProp<ViewStyle>)
    return (
        <PreloadedBannerView
            requestId={handle.requestId}
            style={defaultStyle}
        />
    )
}

export default AdropPreloadedBanner
