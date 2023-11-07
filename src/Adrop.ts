import { NativeModules } from 'react-native'

class Adrop {
    static initialize = (production: boolean) => {
        NativeModules.AdropAds.initialize(production)
    }
}

export default Adrop
