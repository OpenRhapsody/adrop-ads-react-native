import Foundation
import AdropAds

/// Serializes `AdropConsentResult` for the JS side.
///
/// Single source of truth for the payload — the keys must match the `AdropConsentResult` type in
/// `src/consent/AdropConsentResult.ts` and the Android counterpart (`AdropConsentResultMap.kt`).
/// requestConsentInfoUpdate and showPrivacyOptionsForm both resolve with this payload.
extension AdropConsentResult {
    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "status": status.rawValue,
            "canRequestAds": canRequestAds,
            "canShowPersonalizedAds": canShowPersonalizedAds
        ]
        // Omit rather than send NSNull, so JS reads it as undefined like the TS type says.
        if let error = error {
            dict["error"] = error.localizedDescription
        }
        return dict
    }
}
