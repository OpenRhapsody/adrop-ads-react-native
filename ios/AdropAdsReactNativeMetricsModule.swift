import AdropAds

@objc(AdropMetrics)
class AdropAnalyticsModule: RCTEventEmitter {
    
    @objc(setProperty:value:)
    func setProperty(key: String, value: [Any]) {
        if (value.isEmpty) {
            return
        }
        
        let encodableValue = self.convertToEncodable(value[0])
        AdropMetrics.setProperty(key: key, value: encodableValue)
    }
    
    @objc(logEvent:params:)
    func logEvent(name: String, params: [String:Any]?) {
        var encodableParams: [String: Encodable] = [:]
        for (key, value) in (params ?? [:]) {
            if let encodableValue = convertToEncodable(value) {
                encodableParams[key] = encodableValue
            }
        }
        AdropMetrics.logEvent(name: name, params: encodableParams)
    }
    
    private func convertToEncodable(_ value: Any) -> Encodable? {
        switch value {
        case let stringValue as String:
            return stringValue
        case let numberValue as NSNumber:
            if CFGetTypeID(numberValue) == CFBooleanGetTypeID() {
                return numberValue.boolValue
            } else if CFGetTypeID(numberValue) == CFNumberGetTypeID() {
                if numberValue is Int {
                    return numberValue.intValue
                } else if numberValue is Double || numberValue is Float {
                    return numberValue.doubleValue
                } else {
                    return nil
                }
            } else {
                return nil
            }
        case let boolValue as Bool:
            return boolValue
        case _ as [Any]:
            // array not supported
            return nil
        case _ as [String: Any]:
            // dictionary not supported
            return nil
        default:
            if let encodableValue = value as? Encodable {
                return encodableValue
            } else {
                return nil
            }
        }
    }
}
