#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AdropAds, NSObject)

RCT_EXTERN_METHOD(initialize:(BOOL)production
                  targetCountries:(NSArray<NSString *> *)targetCountries
                  useInAppBrowser:(BOOL) useInAppBrowser
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
    return true;
}


@end
