import { AdropAd, AdType } from './AdropAd'

export default class AdropInterstitialAd extends AdropAd {
    constructor(unitId: string) {
        super(AdType.adropInterstitialAd, unitId)
    }
}
