// Fabric (New Architecture) host view for the Adrop native ad container.
// Compiled only when newArchEnabled=true; the Old Architecture uses
// AdropNativeAdViewManager + RNAdropNativeAdView via the bridge.

#ifdef RCT_NEW_ARCH_ENABLED

#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface AdropNativeAdComponentView : RCTViewComponentView
@end

NS_ASSUME_NONNULL_END

#endif // RCT_NEW_ARCH_ENABLED
