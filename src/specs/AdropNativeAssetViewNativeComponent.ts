import type { ViewProps, HostComponent } from 'react-native'
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent'

/**
 * Fabric (New Architecture) wrapper around a single native-ad asset (headline,
 * media, CTA, …). It carries the asset's `assetRole` so the enclosing
 * `AdropNativeAdView` container can classify mounted assets and bind them to the
 * core SDK ad view — replacing the Old Architecture's
 * `bridge.uiManager.view(forReactTag:)` lookup, which does not exist on Fabric.
 *
 * Only rendered on iOS + New Architecture (see `AdropAssetWrapper`). The Old
 * Architecture and Android keep the existing `setNativeProps({ <role>: { tag } })`
 * path, so this component is additive and does not affect them.
 */
export interface NativeProps extends ViewProps {
    assetRole?: string
    nativeAdRequestId?: string
}

export default codegenNativeComponent<NativeProps>(
    'AdropNativeAssetView'
) as HostComponent<NativeProps>
