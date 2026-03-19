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
        this.getNativeModule()?.setServerSideVerificationOptions(
            this._requestId,
            options.userId ?? null,
            options.customData ?? null
        )
    }
}
