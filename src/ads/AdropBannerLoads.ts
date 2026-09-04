import {
    NativeEventEmitter,
    NativeModules,
    type EmitterSubscription,
} from 'react-native'

import { AdropChannel, AdropMethod } from '../bridge'
import { nanoid } from '../utils/id'
import { maxLoadsBatch } from '../utils/loadsBatch'
import { BrowserTarget } from './AdropAd'
import type { AdropBannerMetadata } from './AdropBanner'

/**
 * Identifies one pre-loaded banner slot. Only issued by `AdropBanner.loads()`
 * — do not construct manually. Pass it to `<AdropPreloadedBanner handle={h}/>`
 * to mount, and to `AdropBanner.destroyLoaded(h)` to release the native
 * banner (each one owns a WebView, ~5-15 MB).
 */
export type AdropBannerHandle = {
    readonly unitId: string
    readonly requestId: string
    /** Creative size reported by the server; useful for sizing feed cells. */
    readonly creativeSize?: { width: number; height: number }
}

/**
 * Shared listener for a batch of banners. `requestId` identifies which slot
 * fired (the same unitId can fill several slots).
 */
export type AdropPreloadedBannerListener = {
    onAdClicked?: (
        unitId: string,
        requestId: string,
        metadata?: AdropBannerMetadata
    ) => void
    onAdImpression?: (
        unitId: string,
        requestId: string,
        metadata?: AdropBannerMetadata
    ) => void
    onAdVideoStart?: (unitId: string, requestId: string) => void
    onAdVideoEnd?: (unitId: string, requestId: string) => void
}

export type AdropBannerLoadsOptions = {
    unitId: string
    useCustomClick?: boolean
    listener?: AdropPreloadedBannerListener
}

/** Maps a preloaded-banner event payload to the public metadata shape. */
const toBannerMetadata = (event: any): AdropBannerMetadata => ({
    creativeId: event.creativeId ?? '',
    txId: event.txId ?? '',
    destinationURL: event.destinationURL ?? '',
    campaignId: event.campaignId ?? '',
    browserTarget: event.browserTarget ?? BrowserTarget.EXTERNAL,
    creativeType: event.creativeType ?? 'display',
})

const listeners = new Map<string, AdropPreloadedBannerListener>()
let subscription: EmitterSubscription | undefined

/**
 * One module-level subscription routes every preloaded-banner event to its
 * slot's listener by requestId (instead of N per-component subscriptions).
 */
const ensureSubscribed = () => {
    if (subscription) return
    const module = NativeModules.AdropBanner
    if (!module) return
    subscription = new NativeEventEmitter(module).addListener(
        AdropChannel.preloadedBannerEventChannel,
        (event: any) => {
            const requestId: string = event.requestId ?? ''
            const listener = listeners.get(requestId)
            if (!listener) return
            const unitId: string = event.unitId ?? ''
            switch (event.method) {
                case AdropMethod.didClickAd:
                    listener.onAdClicked?.(
                        unitId,
                        requestId,
                        toBannerMetadata(event)
                    )
                    break
                case AdropMethod.didImpression:
                    listener.onAdImpression?.(
                        unitId,
                        requestId,
                        toBannerMetadata(event)
                    )
                    break
                case AdropMethod.didVideoStart:
                    listener.onAdVideoStart?.(unitId, requestId)
                    break
                case AdropMethod.didVideoEnd:
                    listener.onAdVideoEnd?.(unitId, requestId)
                    break
            }
        }
    )
}

/**
 * Loads up to 5 banners with a single network request and resolves with
 * mountable handles. Mount each with `<AdropPreloadedBanner handle={h}/>`;
 * handles are re-attachable (FlatList recycling unmounts only detach the
 * native view). The native banner lives until `destroyLoaded(handle)` —
 * call it for every handle when the screen goes away, mounted or not.
 *
 * Rejects with `{ code: AdropErrorCode name, message }` (e.g.
 * `ERROR_CODE_AD_NO_FILL` when nothing filled).
 */
export const loadsBanners = async (
    options: AdropBannerLoadsOptions
): Promise<AdropBannerHandle[]> => {
    const module = NativeModules.AdropBanner
    if (!module) {
        return Promise.reject({
            code: 'ERROR_CODE_INITIALIZE',
            message: 'AdropBanner native module unavailable',
        })
    }
    const requestIds = Array.from({ length: maxLoadsBatch }, () => nanoid())
    const response = await module.loads(
        options.unitId,
        requestIds,
        options.useCustomClick ?? false
    )
    ensureSubscribed()

    const filled: string[] = response?.requestIds ?? []
    const ads: any[] = response?.ads ?? []
    return filled.map((requestId, index) => {
        if (options.listener) listeners.set(requestId, options.listener)
        const meta = ads[index]
        const width = meta?.creativeSizeWidth
        const height = meta?.creativeSizeHeight
        return {
            unitId: options.unitId,
            requestId,
            // The core reports 0×0 when the server omits creativeSize; treat
            // that as "unknown" so <AdropPreloadedBanner>'s '100%'/80 default
            // applies instead of collapsing the banner to 0×0 (invisible, no
            // impression, no error).
            creativeSize:
                typeof width === 'number' &&
                typeof height === 'number' &&
                width > 0 &&
                height > 0
                    ? { width, height }
                    : undefined,
        }
    })
}

/**
 * Destroys a batch-loaded banner (native WebView release) and stops its event
 * routing. The handle cannot be mounted afterwards.
 */
export const destroyLoadedBanner = (handle: AdropBannerHandle) => {
    listeners.delete(handle.requestId)
    NativeModules.AdropBanner?.destroy(handle.requestId)
}
