#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AdropConsent, NSObject)

RCT_EXTERN_METHOD(requestConsentInfoUpdate:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getConsentStatus:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(canRequestAds:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(reset)

RCT_EXTERN_METHOD(setDebugSettings:(int)geography)

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end
