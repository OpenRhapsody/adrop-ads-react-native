// Fabric (New Architecture) wrapper for a single native-ad asset.
// Compiled only when newArchEnabled=true.

#ifdef RCT_NEW_ARCH_ENABLED

#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface AdropNativeAssetComponentView : RCTViewComponentView
@property (nonatomic, copy, nullable) NSString *assetRole;
@property (nonatomic, copy, nullable) NSString *nativeAdRequestId;
@end

NS_ASSUME_NONNULL_END

#endif // RCT_NEW_ARCH_ENABLED
