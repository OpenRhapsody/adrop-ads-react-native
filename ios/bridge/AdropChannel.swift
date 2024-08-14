import Foundation

struct AdropChannel {
    static let METHOD_CHANNEL = "io.adrop.adrop-ads"
    static let invokeBannerChannel = "\(METHOD_CHANNEL)/banner"
    
    static func invokeInterstitialChannel(id: String) -> String {
        return "\(METHOD_CHANNEL)/interstitial_\(id)"
    }
    
    static func invokeRewardedChannel(id: String) -> String {
        return "\(METHOD_CHANNEL)/rewarded_\(id)"
    }
    
    static func invokePopupChannel(id: String) -> String {
        return "\(METHOD_CHANNEL)/popup_\(id)"
    }
    
    static func invokeNativeChannel(id: String) -> String {
        return "\(METHOD_CHANNEL)/native_\(id)"
    }
}
