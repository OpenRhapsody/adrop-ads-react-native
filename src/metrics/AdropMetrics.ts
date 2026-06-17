import { getNativeModule } from '../specs'

const AdropMetricsModule = () => getNativeModule('AdropMetrics')

class AdropMetrics {
    static setProperty = (key: string, value: any) => {
        AdropMetricsModule().setProperty(key, [value])
    }

    static sendEvent = (name: string, params?: Record<string, any>) => {
        AdropMetricsModule().sendEvent(name, params ?? null)
    }

    /** @deprecated Use sendEvent instead */
    static logEvent = (name: string, params?: Record<string, any>) => {
        AdropMetricsModule().sendEvent(name, params ?? null)
    }

    static properties = async (): Promise<Record<string, any>> => {
        const properties = await AdropMetricsModule().properties()

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
