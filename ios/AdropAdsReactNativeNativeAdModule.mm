#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(AdropNativeAd, RCTEventEmitter)

RCT_EXTERN_METHOD(create:(NSString *)unitId
                  requestId:(NSString) requestId
                  useCustomClick:(BOOL) useCustomClick
                  preferredAdChoicesPosition:(NSInteger) preferredAdChoicesPosition)

RCT_EXTERN_METHOD(load:(NSString *)unitId
                  requestId:(NSString) requestId
                  useCustomClick:(BOOL) useCustomClick
                  preferredAdChoicesPosition:(NSInteger) preferredAdChoicesPosition)

RCT_EXTERN_METHOD(destroy:(NSString) requestId)

RCT_EXTERN_METHOD(loads:(NSString *)unitId
                  requestIds:(NSArray<NSString *> *) requestIds
                  useCustomClick:(BOOL) useCustomClick
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject)


+ (BOOL)requiresMainQueueSetup
{
    return true;
}

@end
