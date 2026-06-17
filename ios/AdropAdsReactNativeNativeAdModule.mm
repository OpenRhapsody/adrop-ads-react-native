#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <ReactCommon/RCTTurboModule.h>
#import <AdropAdsReactNativeSpec/AdropAdsReactNativeSpec.h>
#endif

@interface RCT_EXTERN_MODULE(AdropNativeAd, RCTEventEmitter)

RCT_EXTERN_METHOD(create:(NSString *)unitId
                  requestId:(NSString) requestId
                  useCustomClick:(BOOL) useCustomClick
                  preferredAdChoicesPosition:(double) preferredAdChoicesPosition)

RCT_EXTERN_METHOD(load:(NSString *)unitId
                  requestId:(NSString) requestId
                  useCustomClick:(BOOL) useCustomClick
                  preferredAdChoicesPosition:(double) preferredAdChoicesPosition)

RCT_EXTERN_METHOD(destroy:(NSString) requestId)


+ (BOOL)requiresMainQueueSetup
{
    return true;
}

@end

#ifdef RCT_NEW_ARCH_ENABLED
// New Architecture TurboModule adapter (Old Arch served by RCT_EXTERN_MODULE above).
// RCTEventEmitter provides addListener/removeListeners required by the spec.
// Selectors aligned to codegen `NativeAdropNativeAdSpec`
// (`preferredAdChoicesPosition` is `double`).
@interface AdropNativeAd (TurboModule) <NativeAdropNativeAdSpec, RCTTurboModule>
@end

@implementation AdropNativeAd (TurboModule)
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeAdropNativeAdSpecJSI>(params);
}
@end
#endif
