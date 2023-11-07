#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AdropAds, NSObject)

RCT_EXTERN_METHOD(initialize:(BOOL)production
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
    return true;
}


@end
