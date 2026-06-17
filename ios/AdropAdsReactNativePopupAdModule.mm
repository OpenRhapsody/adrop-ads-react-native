#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <ReactCommon/RCTTurboModule.h>
#import <AdropAdsReactNativeSpec/AdropAdsReactNativeSpec.h>
#endif

@interface RCT_EXTERN_MODULE(AdropPopupAd, RCTEventEmitter)

RCT_EXTERN_METHOD(create:(NSString *)unitId
                  requestId:(NSString) requestId)

RCT_EXTERN_METHOD(load:(NSString *)unitId
                  requestId:(NSString) requestId)

RCT_EXTERN_METHOD(show:(NSString *)unitId
                  requestId:(NSString) requestId)

RCT_EXTERN_METHOD(customize:(NSString *)requestId
                  data: (NSDictionary *) data)

RCT_EXTERN_METHOD(setUseCustomClick:(NSString *)requestId
                useCustomClick: (BOOL) UseCustomClick)

RCT_EXTERN_METHOD(close:(NSString *)requestId)

RCT_EXTERN_METHOD(destroy:(NSString) requestId)


+ (BOOL)requiresMainQueueSetup
{
    return true;
}

@end

#ifdef RCT_NEW_ARCH_ENABLED
// New Architecture TurboModule adapter (Old Arch served by RCT_EXTERN_MODULE above).
// RCTEventEmitter provides addListener/removeListeners required by the spec.
@interface AdropPopupAd (TurboModule) <NativeAdropPopupAdSpec, RCTTurboModule>
@end

@implementation AdropPopupAd (TurboModule)
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeAdropPopupAdSpecJSI>(params);
}
@end
#endif
