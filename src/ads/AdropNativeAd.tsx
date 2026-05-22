import { NativeEventEmitter, NativeModules, Platform } from 'react-native'

import { nanoid } from '../utils/id'
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
     * Preferred display position for the AdChoices icon on AdMob-backfilled native ads.
     * Has no effect on direct-sold ads; backfill networks such as AdMob may
     * ignore this value per their policies.
     */
    private readonly _preferredAdChoicesPosition: AdropAdChoicesPosition =
        AdropAdChoicesPosition.topRight

    private _loaded: boolean = false
    private _event?: AdropNativeEvent
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
        new NativeEventEmitter(this.eventEmitter()).addListener(
            AdropChannel.nativeEventListenerChannel,
            this._handleEvent.bind(this)
        )
        nativeAdRequestIds.set(this, () => this._requestId)
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
