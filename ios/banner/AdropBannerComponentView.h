// Fabric (New Architecture) host view for the Adrop banner.
// Compiled only when newArchEnabled=true; the Old Architecture uses
// AdropBannerViewManager + AdropBannerViewWrapper via the bridge.

#ifdef RCT_NEW_ARCH_ENABLED

#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface AdropBannerComponentView : RCTViewComponentView
@end

NS_ASSUME_NONNULL_END

#endif // RCT_NEW_ARCH_ENABLED
