import type { ViewProps, HostComponent } from 'react-native'
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent'
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands'
import type {
    Double,
    DirectEventHandler,
    Int32,
} from 'react-native/Libraries/Types/CodegenTypes'

/**
 * Fabric (New Architecture) host-component spec for the banner view.
 *
 * On the New Architecture this generates a `RCTViewComponentView` descriptor;
 * on the Old Architecture `codegenNativeComponent` falls back to
 * `requireNativeComponent('AdropBannerView')`, so a single source serves both.
 *
 * Commands (load/play/pause) are delivered straight to the component view on
 * Fabric — no `bridge.uiManager.view(forReactTag:)` lookup — which is the core
 * of the partner banner freeze fix. Direct events mirror the legacy
 * `BannerEventEmitter` payload so the New Architecture can emit per-view without
 * the bridge; the Old Architecture continues to use the global emitter.
 */

type AdSize = Readonly<{
    width: Double
    height: Double
}>

type BannerAdEvent = Readonly<{
    method: string
    tag: Int32
    errorCode?: string
    creativeId?: string
    txId?: string
    campaignId?: string
    destinationURL?: string
    browserTarget?: Int32
    creativeType?: string
}>

export interface NativeProps extends ViewProps {
    unitId?: string
    useCustomClick?: boolean
    adSize?: AdSize
    // Fabric direct events (New Architecture). Optional; the Old Architecture
    // keeps using the global BannerEventEmitter.
    onAdEvent?: DirectEventHandler<BannerAdEvent>
}

export type AdropBannerViewType = HostComponent<NativeProps>

interface NativeCommands {
    load: (viewRef: React.ElementRef<AdropBannerViewType>) => void
    play: (viewRef: React.ElementRef<AdropBannerViewType>) => void
    pause: (viewRef: React.ElementRef<AdropBannerViewType>) => void
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
    supportedCommands: ['load', 'play', 'pause'],
})

export default codegenNativeComponent<NativeProps>(
    'AdropBannerView'
) as AdropBannerViewType
