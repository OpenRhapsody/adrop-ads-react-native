#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <ReactCommon/RCTTurboModule.h>
#import <AdropAdsReactNativeSpec/AdropAdsReactNativeSpec.h>
#endif

@interface RCT_EXTERN_MODULE(AdropMetrics, RCTEventEmitter)

RCT_EXTERN_METHOD(setProperty:(NSString *)key
                  value: (id) value)

RCT_EXTERN_METHOD(logEvent:(NSString *)name
                  params: (NSDictionary *) params)

RCT_EXTERN_METHOD(sendEvent:(NSString *)name
                  params: (NSDictionary *) params)

RCT_EXTERN_METHOD(properties:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
    return true;
}

@end

#ifdef RCT_NEW_ARCH_ENABLED
// New Architecture TurboModule adapter (Old Arch served by RCT_EXTERN_MODULE above).
@interface AdropMetrics (TurboModule) <NativeAdropMetricsSpec, RCTTurboModule>
@end

@implementation AdropMetrics (TurboModule)
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeAdropMetricsSpecJSI>(params);
}
@end
#endif
