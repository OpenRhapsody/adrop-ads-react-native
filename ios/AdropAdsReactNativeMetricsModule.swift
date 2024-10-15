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
        case let boolValue as Bool:
            return boolValue
        case let numberValue as NSNumber:
            if (CFGetTypeID(numberValue) != CFNumberGetTypeID()) {
                return nil
            } else if (numberValue is Int) {
                return numberValue.intValue
            } else if (numberValue is Float || numberValue is Double) {
                return numberValue.doubleValue
            } else {
                return nil
            }
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
