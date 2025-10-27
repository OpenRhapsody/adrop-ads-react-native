import { NativeEventEmitter, NativeModules, Platform } from 'react-native'
import { AdropChannel, AdropMethod } from '../bridge'
import { nanoid } from '../utils/id'
import { AdropErrorCode } from '../AdropErrorCode'

export enum AdType {
    adropInterstitialAd = 'AdropInterstitialAd',
    adropRewardedAd = 'AdropRewardedAd',
    adropPopupAd = 'AdropPopupAd',
    adropNativeAd = 'AdropNativeAd',
}

type AdropEvent = {
    unitId: string
    method: string
    creativeId?: string
    txId?: string
    campaignId?: string
    errorCode?: string
    type?: number
    amount?: number
    destinationURL?: string
}

export type AdropListener = {
    onAdReceived?: (ad: AdropAd) => void
    onAdClicked?: (ad: AdropAd) => void
    onAdImpression?: (ad: AdropAd) => void
    onAdFailedToReceive?: (ad: AdropAd, errorCode?: any) => void
    onAdDidPresentFullScreen?: (ad: AdropAd) => void
    onAdWillPresentFullScreen?: (ad: AdropAd) => void
    onAdDidDismissFullScreen?: (ad: AdropAd) => void
    onAdWillDismissFullScreen?: (ad: AdropAd) => void
    onAdFailedToShowFullScreen?: (ad: AdropAd, errorCode?: any) => void
    onAdEarnRewardHandler?: (ad: AdropAd, type: number, amount: number) => void
}

export abstract class AdropAd {
    protected _adType: AdType
    protected _unitId: string
    protected _loaded: boolean
    protected _requestId: string = ''
    protected _creativeId: string = ''
    protected _txId: string = ''
    protected _campaignId: string = ''
    protected _destinationURL: string = ''
    public listener?: AdropListener

    protected constructor(adType: AdType, unitId: string) {
        this._adType = adType
        this._unitId = unitId
        this._loaded = false
        this._requestId = nanoid()

        this.getNativeModule()?.create(this.unitId, this._requestId)
        new NativeEventEmitter(this.getEventEmitter()).addListener(
            this.getChannel(this._requestId),
            this._handleEvent.bind(this)
        )
    }

    public get isLoaded() {
        return this._loaded
    }

    public get unitId() {
        return this._unitId
    }

    public get creativeId() {
        return this._creativeId
    }

    public get txId() {
        return this._txId
    }

    public get campaignId() {
        return this._campaignId
    }

    /**
     * @deprecated Use destinationURL instead.
     */
    public get destinationUrl() {
        return this._destinationURL
    }

    public get destinationURL() {
        return this._destinationURL
    }

    public load() {
        const module = this.getNativeModule()
        if (!module) {
            this.listener?.onAdFailedToReceive?.(
                this,
                AdropErrorCode.initialize
            )
            return
        }

        module.load(this.unitId, this._requestId)
    }

    public show() {
        const module = this.getNativeModule()
        if (!module) {
            this.listener?.onAdFailedToReceive?.(
                this,
                AdropErrorCode.initialize
            )
            return
        }

        module.show(this.unitId, this._requestId)
    }

    protected customize(data: Record<string, any>) {
        const module = this.getNativeModule()
        if (!module) {
            this.listener?.onAdFailedToReceive?.(
                this,
                AdropErrorCode.initialize
            )
            return
        }

        module.customize(this._requestId, data)
    }

    protected setUseCustomClick(useCustomClick: boolean = false) {
        const module = this.getNativeModule()
        if (!module) {
            this.listener?.onAdFailedToReceive?.(
                this,
                AdropErrorCode.initialize
            )
            return
        }

        module.setUseCustomClick(this._requestId, useCustomClick)
    }

    public destroy() {
        this.getNativeModule()?.destroy(this._requestId)
    }

    private _handleEvent(event: AdropEvent) {
        if (event.method !== AdropMethod.handleEarnReward) {
            this._creativeId = event.creativeId ?? ''
            this._txId = event.txId ?? ''
            this._campaignId = event.campaignId ?? ''
            this._destinationURL = event.destinationURL ?? ''
        }

        switch (event.method) {
            case AdropMethod.didReceiveAd:
                this._loaded = true
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
            case AdropMethod.willDismissFullScreen:
                this.listener?.onAdWillDismissFullScreen?.(this)
                break
            case AdropMethod.didDismissFullScreen:
                this.listener?.onAdDidDismissFullScreen?.(this)
                break
            case AdropMethod.willPresentFullScreen:
                this.listener?.onAdWillPresentFullScreen?.(this)
                break
            case AdropMethod.didPresentFullScreen:
                this.listener?.onAdDidPresentFullScreen?.(this)
                break
            case AdropMethod.didFailToShowFullScreen:
                this.listener?.onAdFailedToShowFullScreen?.(
                    this,
                    event.errorCode
                )
                break
            case AdropMethod.handleEarnReward:
                this.listener?.onAdEarnRewardHandler?.(
                    this,
                    event.type ?? 0,
                    event.amount ?? 0
                )
                break
        }
    }

    private getNativeModule(): any {
        return NativeModules[this._adType]
    }

    private getEventEmitter(): any {
        if (Platform.OS === 'android') return NativeModules.EventEmitter

        return this.getNativeModule()
    }

    private getChannel(requestId: string): string {
        return AdropChannel.adropEventListenerChannel(this._adType, requestId)
    }
}
