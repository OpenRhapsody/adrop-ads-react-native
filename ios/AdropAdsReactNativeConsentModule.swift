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
                resolve(result.toDictionary())
            }
        }
    }

    @objc
    func showPrivacyOptionsForm(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        // This module does not set methodQueue, so it is called on a background queue. UMP is main-thread only.
        DispatchQueue.main.async {
            guard let consentManager = Adrop.consentManager else {
                reject("ERROR", "ConsentManager is not available. Make sure adrop-ads-backfill is installed.", nil)
                return
            }

            // Pass nil instead of picking a presenting screen — UMP presents from the topmost screen of the main window.
            // This form is opened from a settings screen, which is often a native-stack modal, so
            // presenting from rootViewController is rejected by UIKit.
            consentManager.showPrivacyOptionsForm(from: nil) { result in
                resolve(result.toDictionary())
            }
        }
    }

    // Unlike the other consent getters, this resolves UNKNOWN instead of rejecting when there is no manager,
    // so a settings screen can decide whether to show the entry point without try/catch.
    @objc
    func getPrivacyOptionsRequirementStatus(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            let status = Adrop.consentManager?.getPrivacyOptionsRequirementStatus() ?? .unknown
            resolve(status.rawValue)
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

    @objc
    func setDebugSettings(_ geography: Int) {
        guard let consentManager = Adrop.consentManager else {
            return
        }

        let debugGeography: AdropConsentDebugGeography
        switch geography {
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
