#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(AdropNativeAd, RCTEventEmitter)

RCT_EXTERN_METHOD(create:(NSString *)unitId
                  requestId:(NSString) requestId
                  useCustomClick:(BOOL) useCustomClick)

RCT_EXTERN_METHOD(load:(NSString *)unitId
                  requestId:(NSString) requestId
                  useCustomClick:(BOOL) useCustomClick)

RCT_EXTERN_METHOD(destroy:(NSString) requestId)


+ (BOOL)requiresMainQueueSetup
{
    return true;
}

@end
