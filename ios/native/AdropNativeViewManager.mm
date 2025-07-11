#import <React/RCTViewManager.h>


@interface RCT_EXTERN_MODULE(AdropNativeAdViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(headline, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(body, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(icon, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(mediaView, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(advertiser, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(callToAction, NSDictionary)

RCT_EXTERN_METHOD(performClick:(nonnull NSNumber *)node requestId:(NSString *)requestId)

@end
