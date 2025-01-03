import { NativeModules } from 'react-native'

class AdropMetrics {
    static setProperty = (key: string, value: any) => {
        NativeModules.AdropMetrics.setProperty(key, [value])
    }

    static logEvent = (name: string, params?: Record<string, any>) => {
        NativeModules.AdropMetrics.logEvent(name, params)
    }

    static properties = async (): Promise<Record<string, any>> => {
        const properties = await NativeModules.AdropMetrics.properties()

        if (
            typeof properties === 'object' &&
            properties !== null &&
            !Array.isArray(properties)
        ) {
            return properties as Record<string, any>
        }

        return {}
    }
}

export default AdropMetrics
