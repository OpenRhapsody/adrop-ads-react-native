#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <ReactCommon/RCTTurboModule.h>
#import <AdropAdsReactNativeSpec/AdropAdsReactNativeSpec.h>
#endif

@interface RCT_EXTERN_MODULE(AdropRewardedAd, RCTEventEmitter)

RCT_EXTERN_METHOD(create:(NSString *)unitId
                  requestId:(NSString) requestId)

RCT_EXTERN_METHOD(setServerSideVerificationOptions:(NSString *)requestId
                  userId:(NSString *)userId
                  customData:(NSString *)customData)

RCT_EXTERN_METHOD(load:(NSString *)unitId
                  requestId:(NSString) requestId)

RCT_EXTERN_METHOD(show:(NSString *)unitId
                  requestId:(NSString) requestId)

RCT_EXTERN_METHOD(destroy:(NSString *)requestId)


+ (BOOL)requiresMainQueueSetup
{
    return true;
}

@end

#ifdef RCT_NEW_ARCH_ENABLED
// New Architecture TurboModule adapter (Old Arch served by RCT_EXTERN_MODULE above).
// RCTEventEmitter provides addListener/removeListeners required by the spec.
@interface AdropRewardedAd (TurboModule) <NativeAdropRewardedAdSpec, RCTTurboModule>
@end

@implementation AdropRewardedAd (TurboModule)
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeAdropRewardedAdSpecJSI>(params);
}
@end
#endif
