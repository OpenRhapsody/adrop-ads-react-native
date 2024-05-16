import { NativeModules } from 'react-native'

class AdropMetrics {
    static setProperty = (key: string, value: string) => {
        NativeModules.AdropMetrics.setProperty(key, value)
    }

    static logEvent = (name: string, params?: Record<string, any>) => {
        NativeModules.AdropMetrics.logEvent(name, params)
    }
}

export default AdropMetrics
