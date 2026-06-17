import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
@objc
class AppDelegate: UIResponder, UIApplicationDelegate {
    // The UIScene (SceneDelegate) owns the real window, but React's legacy
    // RCTDeviceInfo (Old Architecture) calls `[appDelegate window]` for interface
    // orientation — without this property it crashes with
    // "-[AppDelegate window]: unrecognized selector". Keep it (nil is fine).
    var window: UIWindow?

    var reactNativeDelegate: ReactNativeDelegate?
    // Exposed to the (ObjC) SceneDelegate, which builds the React root view from
    // this factory onto the UIScene's window. The factory drives the bridgeless /
    // New Architecture host (TurboModules + Fabric). The app uses UIScene, so the
    // window/root must live in the SceneDelegate — not here.
    @objc var reactNativeFactory: RCTReactNativeFactory?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        let delegate = ReactNativeDelegate()
        delegate.dependencyProvider = RCTAppDependencyProvider()
        reactNativeDelegate = delegate
        reactNativeFactory = RCTReactNativeFactory(delegate: delegate)
        return true
    }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
    // bundleURL: used by the bridgeless (New Architecture) host.
    // sourceURL(for:): used by the bridge (Old Architecture) path — without it,
    // old-arch builds crash with "RCTBridgeDelegate::sourceURLForBridge not
    // implemented". Override both so the delegate works in either architecture.
    override func sourceURL(for bridge: RCTBridge) -> URL? {
        return bundleURL()
    }

    override func bundleURL() -> URL? {
        #if DEBUG
        return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
        #else
        return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
        #endif
    }
}
