import React, { useContext } from 'react'
import { Platform } from 'react-native'
import {
    AdropNativeContext,
    nativeAdRequestIds,
} from '../contexts/AdropNativeContext'
import AdropNativeAssetView from '../specs/AdropNativeAssetViewNativeComponent'
import { isFabricEnabled } from '../utils/arch'

export type AssetRole =
    | 'headline'
    | 'body'
    | 'icon'
    | 'mediaView'
    | 'advertiser'
    | 'callToAction'
    | 'profileLogo'
    | 'profileName'

/**
 * Wraps a native-ad asset so the New Architecture container can bind it.
 *
 * - iOS + New Architecture (Fabric): renders `AdropNativeAssetView` carrying
 *   `assetRole`; the container collects these on mount and binds them to the SDK
 *   ad view (no `bridge.uiManager` lookup).
 * - Old Architecture / Android: renders children as-is, so the existing
 *   `setNativeProps({ <role>: { tag } })` binding (inside each asset view) keeps
 *   working unchanged.
 */
const AdropAssetWrapper: React.FC<{
    role: AssetRole
    children: React.ReactNode
}> = ({ role, children }) => {
    const { nativeAd } = useContext(AdropNativeContext)

    if (Platform.OS !== 'ios' || !isFabricEnabled) {
        return <>{children}</>
    }

    const requestId =
        (nativeAd ? nativeAdRequestIds.get(nativeAd)?.() : '') ?? ''

    return (
        <AdropNativeAssetView assetRole={role} nativeAdRequestId={requestId}>
            {children}
        </AdropNativeAssetView>
    )
}

export default AdropAssetWrapper
