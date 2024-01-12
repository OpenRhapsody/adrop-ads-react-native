#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(AdropInterstitialAd, RCTEventEmitter)

RCT_EXTERN_METHOD(create:(NSString *)unitId
                  requestId:(NSString) requestId)

RCT_EXTERN_METHOD(load:(NSString *)unitId
                  requestId:(NSString) requestId)

RCT_EXTERN_METHOD(show:(NSString *)unitId
                  requestId:(NSString) requestId)

RCT_EXTERN_METHOD(destroy:(NSString) requestId)


+ (BOOL)requiresMainQueueSetup
{
    return true;
}

@end
