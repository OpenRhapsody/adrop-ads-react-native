import { NativeEventEmitter, NativeModules, Platform } from 'react-native'

import { nanoid } from '../utils/id'
import { AdropChannel, AdropMethod } from '../bridge'
import { AdType } from './AdropAd'
import { AdropErrorCode } from '../AdropErrorCode'

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
}

interface AdropNativeEvent extends AdropNativeProperties {
    unitId: string
    method: string
    creativeId?: string
    errorCode?: string
    txId?: string
    creative?: string
    requestId?: string
}

export interface AdropNativeAdListener {
    onAdReceived?: (ad: AdropNativeAd) => void
    onAdClicked?: (ad: AdropNativeAd) => void
    onAdFailedToReceive?: (ad: AdropNativeAd, errorCode?: any) => void
}

export default class AdropNativeAd {
    private readonly _unitId: string
    private readonly _requestId: string = ''
    private _loaded: boolean = false
    private _event?: AdropNativeEvent
    public listener?: AdropNativeAdListener

    constructor(unitId: string) {
        this._unitId = unitId
        this._requestId = nanoid()

        this.getNativeModule()?.create(this._unitId, this._requestId)
        new NativeEventEmitter(this.eventEmitter()).addListener(
            AdropChannel.nativeEventListenerChannel,
            this._handleEvent.bind(this)
        )
    }

    public get isLoaded() {
        return this._loaded
    }

    public get unitId() {
        return this._unitId
    }

    public get requestId() {
        return this._requestId
    }

    public get creativeId() {
        return this._event?.creativeId ?? ''
    }

    public get properties() {
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

        nativeModule.load(this._unitId, this._requestId)
    }

    public destroy() {
        this.getNativeModule()?.destroy(this._requestId)
    }

    private _handleEvent(event: AdropNativeEvent) {
        if (event.requestId !== this._requestId) return

        switch (event.method) {
            case AdropMethod.didReceiveAd:
                this._loaded = true
                this._event = event
                this.listener?.onAdReceived?.(this)
                break
            case AdropMethod.didClickAd:
                this.listener?.onAdClicked?.(this)
                break
            case AdropMethod.didFailToReceiveAd:
                this.listener?.onAdFailedToReceive?.(this, event.errorCode)
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
