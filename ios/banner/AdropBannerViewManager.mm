#import <React/RCTViewManager.h>
#import <React/RCTEventEmitter.h>


@interface RCT_EXTERN_MODULE(AdropBannerViewManager, RCTViewManager)
RCT_EXTERN_METHOD(load:(nonnull NSNumber *)reactTag)
RCT_EXPORT_VIEW_PROPERTY(unitId, NSString)
RCT_EXPORT_VIEW_PROPERTY(useCustomClick, BOOL)
@end

@interface RCT_EXTERN_MODULE(BannerEventEmitter, RCTEventEmitter)
@end
