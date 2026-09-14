import Foundation
import AdropAds

/// Serializes `AdropAdValue` for the JS side.
///
/// Single source of truth for the payload — the keys and the `precision` spelling must match
/// the `AdropAdValue` type in `src/ads/AdropAdValue.ts` and the Android counterpart
/// (`AdropAdValueMap.kt`). Keeping one copy per platform is what stops the two bridges from
/// drifting apart.
extension AdropAdValue {
    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "network": network,
            "valueMicros": valueMicros,
            "currencyCode": currencyCode,
            "precision": precision.jsName
        ]
        // Omit rather than send NSNull, so JS reads it as undefined like the TS type says.
        if let adSourceName = adSourceName {
            dict["adSourceName"] = adSourceName
        }
        return dict
    }
}

extension AdropAdValuePrecision {
    /// Stable wire name, matching the Android and TypeScript spellings.
    var jsName: String {
        switch self {
        case .unknown: return "unknown"
        case .estimated: return "estimated"
        case .publisherProvided: return "publisherProvided"
        case .precise: return "precise"
        @unknown default: return "unknown"
        }
    }
}
