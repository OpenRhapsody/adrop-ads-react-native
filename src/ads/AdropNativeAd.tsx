import {
    NativeEventEmitter,
    NativeModules,
    Platform,
    type EmitterSubscription,
} from 'react-native'

import { nanoid } from '../utils/id'
import { maxLoadsBatch } from '../utils/loadsBatch'
import { AdropChannel, AdropMethod } from '../bridge'
import { AdType, BrowserTarget } from './AdropAd'
import { AdropAdChoicesPosition } from './AdropAdChoicesPosition'
import { AdropErrorCode } from '../AdropErrorCode'
import {
    nativeAdRequestIds,
    nativeAdDataListeners,
} from '../contexts/AdropNativeContext'

export type AdropNativeProfile = {
    displayName: string
    displayLogo: string
}

export type AdropNativeProperties = {
    icon?: string
    cover?: string
    headline?: string
    body?: string
    creative?: string
    asset?: string
    destinationURL?: string
    advertiserURL?: string
    accountTag?: string
    creativeTag?: string
    advertiser?: string
    callToAction?: string
    profile?: AdropNativeProfile
    extra?: Record<string, string>
    isBackfilled?: boolean
}

interface AdropNativeEvent extends AdropNativeProperties {
    unitId: string
    method: string
    creativeId?: string
    errorCode?: string
    txId?: string
    campaignId?: string
    creative?: string
    requestId?: string
    isBackfilled?: boolean
    isVideoAd?: boolean
    browserTarget?: BrowserTarget
    creativeType?: 'display' | 'video'
}

export type AdropNativeAdLoadsOptions = {
    unitId: string
    useCustomClick?: boolean
    listener?: AdropNativeAdListener
}

export interface AdropNativeAdListener {
    onAdReceived?: (ad: AdropNativeAd) => void
    onAdClicked?: (ad: AdropNativeAd) => void
    onAdImpression?: (ad: AdropNativeAd) => void
    onAdFailedToReceive?: (ad: AdropNativeAd, errorCode?: any) => void
    onAdVideoStart?: (ad: AdropNativeAd) => void
    onAdVideoEnd?: (ad: AdropNativeAd) => void
}

export default class AdropNativeAd {
    private readonly _unitId: string
    private readonly _requestId: string = ''

    /**
     * Enables custom click handling for the native ad.
     * When set to true:
     * - Allows custom implementation of click behavior
     * - Enables video controller controls for video ads (when false, AdropNativeAdView intercepts all clicks)
     */
    private readonly _useCustomClick: boolean = false

    /**
     * Preferred placement for the AdChoices icon on AdMob backfill native ads.
     * Has no effect on direct ads; the backfill network (e.g. AdMob) may
     * override this per policy.
     */
    private readonly _preferredAdChoicesPosition: AdropAdChoicesPosition =
        AdropAdChoicesPosition.topRight

    private _loaded: boolean = false
    private _event?: AdropNativeEvent
    private _subscription?: EmitterSubscription
    public listener?: AdropNativeAdListener

    constructor(
        unitId: string,
        useCustomClick: boolean = false,
        preferredAdChoicesPosition: AdropAdChoicesPosition = AdropAdChoicesPosition.topRight
    ) {
        this._unitId = unitId
        this._requestId = nanoid()
        this._useCustomClick = useCustomClick
        this._preferredAdChoicesPosition = preferredAdChoicesPosition

        this.getNativeModule()?.create(
            this._unitId,
            this._requestId,
            this._useCustomClick,
            this._preferredAdChoicesPosition
        )
        this._subscription = new NativeEventEmitter(
            this.eventEmitter()
        ).addListener(
            AdropChannel.nativeEventListenerChannel,
            this._handleEvent.bind(this)
        )
        nativeAdRequestIds.set(this, () => this._requestId)
    }

    /**
     * Loads up to 5 native ads with a single network request. The returned
     * instances are already loaded (`isLoaded` is `true`) — do NOT call
     * `load()` on them (a second load would issue another network request).
     * Bind each to `<AdropNativeAdView>` as usual; re-mounting a recycled
     * list item re-binds the same instance.
     *
     * Batch-loaded ads are always direct ads (`isBackfilled` is `false`) —
     * the batch path intentionally skips the backfill fallback.
     *
     * Every returned instance owns a native WebView (~5-15 MB): call
     * `destroy()` on each one when done, including instances never bound to
     * a view.
     *
     * Rejects with `{ code: AdropErrorCode name, message }` (e.g.
     * `ERROR_CODE_AD_NO_FILL` when nothing filled).
     */
    public static async loads(
        options: AdropNativeAdLoadsOptions
    ): Promise<AdropNativeAd[]> {
        const nativeModule = NativeModules[AdType.adropNativeAd]
        if (!nativeModule) {
            return Promise.reject({
                code: 'ERROR_CODE_INITIALIZE',
                message: 'AdropNativeAd native module unavailable',
            })
        }
        const requestIds = Array.from({ length: maxLoadsBatch }, () => nanoid())
        const response = await nativeModule.loads(
            options.unitId,
            requestIds,
            options.useCustomClick ?? false
        )

        const filled: string[] = response?.requestIds ?? []
        const ads: any[] = response?.ads ?? []
        return filled.map((requestId, index) =>
            AdropNativeAd._adoptPreloaded(
                options.unitId,
                requestId,
                ads[index] ?? {},
                options.useCustomClick ?? false,
                options.listener
            )
        )
    }

    /**
     * Wraps an ad already loaded natively by `loads()`. Bypasses the public
     * constructor (which would call `create` and mint a fresh instance) via
     * `Object.create`, then seeds the private fields directly — `_event` is
     * hydrated from the batch response since `didReceiveAd` never fires on
     * the batch path.
     */
    private static _adoptPreloaded(
        unitId: string,
        requestId: string,
        event: AdropNativeEvent,
        useCustomClick: boolean,
        listener?: AdropNativeAdListener
    ): AdropNativeAd {
        const ad = Object.create(AdropNativeAd.prototype) as AdropNativeAd
        // Readonly fields are normally constructor-assigned; this factory is
        // the class-internal second construction path.
        const mutable = ad as any
        mutable._unitId = unitId
        mutable._requestId = requestId
        mutable._useCustomClick = useCustomClick
        mutable._preferredAdChoicesPosition = AdropAdChoicesPosition.topRight
        mutable._loaded = true
        mutable._event = event
        ad.listener = listener
        mutable._subscription = new NativeEventEmitter(
            ad.eventEmitter()
        ).addListener(
            AdropChannel.nativeEventListenerChannel,
            ad._handleEvent.bind(ad)
        )
        nativeAdRequestIds.set(ad, () => requestId)
        return ad
    }

    public get isLoaded() {
        return this._loaded
    }

    public get unitId() {
        return this._unitId
    }

    /**
     * @deprecated This property will be removed in future versions
     */
    public get requestId() {
        return ''
    }

    public get useCustomClick(): boolean {
        return this._useCustomClick
    }

    public get creativeId(): string {
        return this._event?.creativeId ?? ''
    }

    public get txId(): string {
        return this._event?.txId ?? ''
    }

    public get campaignId(): string {
        return this._event?.campaignId ?? ''
    }

    public get isBackfilled(): boolean {
        return this._event?.isBackfilled ?? false
    }

    public get isVideoAd(): boolean {
        return this._event?.isVideoAd ?? false
    }

    public get browserTarget(): BrowserTarget {
        return this._event?.browserTarget ?? BrowserTarget.EXTERNAL
    }

    /**
     * Creative medium of the loaded ad: `'display'` or `'video'`.
     * Defaults to `'display'` before an ad is received.
     */
    public get creativeType(): 'display' | 'video' {
        return this._event?.creativeType ?? 'display'
    }

    public get properties(): AdropNativeProperties {
        if (!this._event) return {} as AdropNativeProperties

        return {
            icon: this._event?.icon,
            cover: this._event?.cover,
            headline: this._event?.headline,
            body: this._event?.body,
            destinationURL: this._event?.destinationURL,
            advertiserURL: this._event?.advertiserURL,
            accountTag: this._event?.accountTag,
            creativeTag: this._event?.creativeTag,
            advertiser: this._event?.advertiser,
            callToAction: this._event?.callToAction,
            creative: this._event?.creative,
            extra: JSON.parse((this._event?.extra as any) ?? '{}') as Record<
                string,
                string
            >,
            profile: {
                displayName: (this._event as any).profileName ?? '',
                displayLogo: (this._event as any).profileLogo ?? '',
            },
            asset: this._event?.asset,
            isBackfilled: this._event?.isBackfilled,
        }
    }

    public load() {
        this._loaded = false
        this._event = undefined

        const nativeModule = this.getNativeModule()
        if (!nativeModule) {
            this.listener?.onAdFailedToReceive?.(
                this,
                AdropErrorCode.initialize
            )
            return
        }

        nativeModule.load(
            this._unitId,
            this._requestId,
            this._useCustomClick,
            this._preferredAdChoicesPosition
        )
    }

    public destroy() {
        this._subscription?.remove()
        this._subscription = undefined
        this.getNativeModule()?.destroy(this._requestId)
        nativeAdRequestIds.delete(this)
        nativeAdDataListeners.delete(this)
    }

    private _handleEvent(event: AdropNativeEvent) {
        if (event.requestId !== this._requestId) return

        this._event = event

        switch (event.method) {
            case AdropMethod.didReceiveAd:
                this._loaded = true
                nativeAdDataListeners.get(this)?.forEach((fn) => fn())
                this.listener?.onAdReceived?.(this)
                break
            case AdropMethod.didClickAd:
                this.listener?.onAdClicked?.(this)
                break
            case AdropMethod.didFailToReceiveAd:
                this.listener?.onAdFailedToReceive?.(this, event.errorCode)
                break
            case AdropMethod.didImpression:
                this.listener?.onAdImpression?.(this)
                break
            case AdropMethod.didVideoStart:
                this.listener?.onAdVideoStart?.(this)
                break
            case AdropMethod.didVideoEnd:
                this.listener?.onAdVideoEnd?.(this)
                break
        }
    }

    private eventEmitter() {
        if (Platform.OS === 'android') return NativeModules.EventEmitter
        return this.getNativeModule()
    }

    private getNativeModule(): any {
        return NativeModules[AdType.adropNativeAd]
    }
}
