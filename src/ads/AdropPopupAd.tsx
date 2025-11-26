import { AdropAd, AdType } from './AdropAd'
import { toHexString } from '../utils'

export type AdropPopupAdColors = {
    closeTextColor?: string
    hideForTodayTextColor?: string
    backgroundColor?: string
}

export default class AdropPopupAd extends AdropAd {
    constructor(
        unitId: string,
        colors?: AdropPopupAdColors,
        useCustomClick?: boolean
    ) {
        super(AdType.adropPopupAd, unitId)
        this.customize({
            closeTextColor: toHexString(colors?.closeTextColor),
            hideForTodayTextColor: toHexString(colors?.hideForTodayTextColor),
            backgroundColor: toHexString(colors?.backgroundColor),
        })

        this.setUseCustomClick(useCustomClick ?? false)
    }

    public close() {
        const module = this.getNativeModule()
        if (module && module.close) {
            module.close(this._requestId)
        }
    }

    /**
     * @deprecated Use creativeId() instead.
     **/
    public createIds(): string[] {
        return []
    }
}
