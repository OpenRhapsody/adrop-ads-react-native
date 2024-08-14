import { AdropAd, AdType } from './AdropAd'
import { toHexString } from '../utils'

export type AdropPopupAdColors = {
    closeTextColor?: string
    hideForTodayTextColor?: string
    backgroundColor?: string
}

export default class AdropPopupAd extends AdropAd {
    constructor(unitId: string, colors?: AdropPopupAdColors) {
        super(AdType.adropPopupAd, unitId)
        this.customize({
            closeTextColor: toHexString(colors?.closeTextColor),
            hideForTodayTextColor: toHexString(colors?.hideForTodayTextColor),
            backgroundColor: toHexString(colors?.backgroundColor),
        })
    }

    public createIds(): string[] {
        return this._creativeId.split(',').filter((_) => !!_)
    }
}
