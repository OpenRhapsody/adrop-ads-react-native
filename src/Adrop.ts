import { NativeModules } from 'react-native'

class Adrop {
    static initialize = (production: boolean, targetCountries?: string[]) => {
        NativeModules.AdropAds.initialize(production, targetCountries ?? [])
    }
}

export default Adrop
