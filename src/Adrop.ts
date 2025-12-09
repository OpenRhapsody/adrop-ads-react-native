import { NativeModules } from 'react-native'
import type { AdropTheme } from './AdropTheme'

class Adrop {
    static initialize = (
        production: boolean,
        targetCountries?: string[],
        useInAppBrowser?: boolean
    ) => {
        NativeModules.AdropAds.initialize(
            production,
            targetCountries ?? [],
            useInAppBrowser ?? false
        )
    }

    static setUID(uid: string) {
        NativeModules.AdropAds.setUID(uid)
    }

    static setTheme(theme: AdropTheme) {
        NativeModules.AdropAds.setTheme(theme)
    }
}

export default Adrop
