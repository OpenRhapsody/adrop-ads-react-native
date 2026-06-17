import type { ViewProps, HostComponent } from 'react-native'
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent'
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands'

/**
 * Fabric (New Architecture) host-component spec for the native-ad container.
 *
 * On the Old Architecture `codegenNativeComponent` falls back to
 * `requireNativeComponent('AdropNativeAdView')`.
 *
 * Asset binding differs by architecture:
 * - Old Architecture: asset views push `{ tag, requestId }` via `setNativeProps`
 *   and the native container resolves them with `bridge.uiManager.view(forReactTag:)`.
 * - New Architecture: that lookup does not exist. The container collects asset
 *   views in `mountChildComponentView:` and classifies them by an `assetRole`
 *   carried on each asset wrapper. The codegen spec here exposes the common
 *   surface (`nativeAdRequestId` + the `performClick` command).
 *
 * `performClick` replaces the legacy `AdropNativeAdViewManager.performClick`
 * module call (which used `bridge.uiManager` and no-ops under bridgeless): the
 * command is delivered straight to the container view.
 */

export interface NativeProps extends ViewProps {
    nativeAdRequestId?: string
}

export type AdropNativeAdViewType = HostComponent<NativeProps>

interface NativeCommands {
    performClick: (viewRef: React.ElementRef<AdropNativeAdViewType>) => void
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
    supportedCommands: ['performClick'],
})

export default codegenNativeComponent<NativeProps>(
    'AdropNativeAdView'
) as AdropNativeAdViewType
