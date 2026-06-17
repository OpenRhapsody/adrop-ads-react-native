import { AdropAd, AdType } from './AdropAd'

export type ServerSideVerificationOptions = {
    userId?: string
    customData?: string
}

export default class AdropRewardedAd extends AdropAd {
    constructor(unitId: string) {
        super(AdType.adropRewardedAd, unitId)
    }

    public setServerSideVerificationOptions(
        options: ServerSideVerificationOptions
    ) {
        // The codegen spec declares non-null strings, so unset values are sent
        // as '' (both platforms treat empty as "unset"); null would be rejected
        // by New Architecture codegen validation and crashes Android's non-null
        // Kotlin parameter on the Old Architecture bridge.
        this.getNativeModule()?.setServerSideVerificationOptions(
            this._requestId,
            options.userId ?? '',
            options.customData ?? ''
        )
    }
}
