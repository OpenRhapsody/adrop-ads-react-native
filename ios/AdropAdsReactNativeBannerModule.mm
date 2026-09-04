#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(AdropBanner, RCTEventEmitter)

RCT_EXTERN_METHOD(loads:(NSString *)unitId
                  requestIds:(NSArray<NSString *> *) requestIds
                  useCustomClick:(BOOL) useCustomClick
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject)

RCT_EXTERN_METHOD(destroy:(NSString *) requestId)

+ (BOOL)requiresMainQueueSetup
{
    return true;
}

@end
