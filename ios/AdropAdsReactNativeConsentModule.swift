import AdropAds
import React
import UIKit

@objc(AdropConsent)
class AdropConsentModule: NSObject {

    @objc
    func requestConsentInfoUpdate(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            guard let consentManager = Adrop.consentManager else {
                reject("ERROR", "ConsentManager is not available. Make sure adrop-ads-backfill is installed.", nil)
                return
            }

            let viewController = self.topViewController()

            consentManager.requestConsentInfoUpdate(from: viewController) { result in
                var map: [String: Any] = [
                    "status": result.status.rawValue,
                    "canRequestAds": result.canRequestAds,
                    "canShowPersonalizedAds": result.canShowPersonalizedAds
                ]
                if let error = result.error {
                    map["error"] = error.localizedDescription
                }
                resolve(map)
            }
        }
    }

    private func topViewController() -> UIViewController? {
        var keyWindow: UIWindow?
        if #available(iOS 13.0, *) {
            keyWindow = UIApplication.shared.connectedScenes
                .compactMap { $0 as? UIWindowScene }
                .flatMap { $0.windows }
                .first { $0.isKeyWindow }
        } else {
            keyWindow = UIApplication.shared.keyWindow
        }
        return keyWindow?.rootViewController
    }

    @objc
    func getConsentStatus(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let consentManager = Adrop.consentManager else {
            reject("ERROR", "ConsentManager is not available. Make sure adrop-ads-backfill is installed.", nil)
            return
        }

        let status = consentManager.getConsentStatus()
        resolve(status.rawValue)
    }

    @objc
    func canRequestAds(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let consentManager = Adrop.consentManager else {
            reject("ERROR", "ConsentManager is not available. Make sure adrop-ads-backfill is installed.", nil)
            return
        }

        let canRequest = consentManager.canRequestAds()
        resolve(canRequest)
    }

    @objc
    func reset() {
        guard let consentManager = Adrop.consentManager else {
            return
        }
        consentManager.reset()
    }

    // `geography` is `Double` to match the codegen spec (Int32 → double); the
    // switch converts back. Old Architecture passes a bridge-coerced number.
    @objc
    func setDebugSettings(_ geography: Double) {
        guard let consentManager = Adrop.consentManager else {
            return
        }

        let debugGeography: AdropConsentDebugGeography
        switch Int(geography) {
        case 0:
            debugGeography = .disabled
        case 1:
            debugGeography = .EEA
        case 2:
            debugGeography = .notEEA
        case 3:
            debugGeography = .regulatedUSState
        case 4:
            debugGeography = .other
        default:
            debugGeography = .disabled
        }

        let deviceIdentifier = UIDevice.current.identifierForVendor?.uuidString ?? ""
        consentManager.setDebugSettings(testDeviceIdentifiers: [deviceIdentifier], geography: debugGeography)
    }
}
