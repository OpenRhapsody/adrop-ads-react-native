import Foundation

struct AdropChannel {
    static let METHOD_CHANNEL = "io.adrop.adrop-ads"
    static let METHOD_BANNER_CHANNEL = "\(METHOD_CHANNEL)/banner"
    
    static func methodBannerChannelOf(id: Int) -> String {
        return "\(METHOD_BANNER_CHANNEL)_\(id)"
    }
}
