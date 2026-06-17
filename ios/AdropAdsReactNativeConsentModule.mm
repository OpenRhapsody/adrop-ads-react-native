#import <React/RCTBridgeModule.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <ReactCommon/RCTTurboModule.h>
#import <AdropAdsReactNativeSpec/AdropAdsReactNativeSpec.h>
#endif

@interface RCT_EXTERN_MODULE(AdropConsent, NSObject)

RCT_EXTERN_METHOD(requestConsentInfoUpdate:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getConsentStatus:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(canRequestAds:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(reset)

RCT_EXTERN_METHOD(setDebugSettings:(double)geography)

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end

#ifdef RCT_NEW_ARCH_ENABLED
// New Architecture TurboModule adapter (Old Arch served by RCT_EXTERN_MODULE above).
// Selectors aligned to codegen `NativeAdropConsentSpec` (setDebugSettings is
// `double`).
@interface AdropConsent (TurboModule) <NativeAdropConsentSpec, RCTTurboModule>
@end

@implementation AdropConsent (TurboModule)
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeAdropConsentSpecJSI>(params);
}
@end
#endif
