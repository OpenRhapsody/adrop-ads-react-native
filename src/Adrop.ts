import { NativeModules } from 'react-native'

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
}

export default Adrop
