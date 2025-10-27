import { AdropAd, AdType } from './AdropAd'

export default class AdropRewardedAd extends AdropAd {
    constructor(unitId: string) {
        super(AdType.adropRewardedAd, unitId)
    }
}
