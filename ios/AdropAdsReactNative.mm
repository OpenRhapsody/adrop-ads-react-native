#import <React/RCTBridgeModule.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <ReactCommon/RCTTurboModule.h>
#import <AdropAdsReactNativeSpec/AdropAdsReactNativeSpec.h>
#endif

@interface RCT_EXTERN_MODULE(AdropAds, NSObject)

RCT_EXTERN_METHOD(initialize:(BOOL)production
                  targetCountries:(NSArray<NSString *> *)targetCountries
                  useInAppBrowser:(BOOL) useInAppBrowser)

RCT_EXTERN_METHOD(setUID:(NSString *)uid)

RCT_EXTERN_METHOD(setTheme:(NSString *)theme)

RCT_EXTERN_METHOD(setMarketingConsent:(BOOL)consent)

RCT_EXTERN_METHOD(registerWebView:(double)viewTag
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
    return true;
}


@end

#ifdef RCT_NEW_ARCH_ENABLED
// New Architecture: vend this legacy Swift module as a JSI TurboModule.
// The RCT_EXTERN_MODULE registration above still serves the Old Architecture
// (bridge) build; this category compiles only when newArchEnabled=true, so
// Old Arch is preserved unchanged.
//
// Selectors aligned to codegen `NativeAdropAdsSpec`: initialize/setUID/setTheme
// are void, registerWebView is `resolve:reject:` with a `double` tag (see the
// .swift).
@interface AdropAds (TurboModule) <NativeAdropAdsSpec, RCTTurboModule>
@end

@implementation AdropAds (TurboModule)
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeAdropAdsSpecJSI>(params);
}
@end
#endif
