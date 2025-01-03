#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(AdropMetrics, RCTEventEmitter)

RCT_EXTERN_METHOD(setProperty:(NSString *)key
                  value: (id) value)

RCT_EXTERN_METHOD(logEvent:(NSString *)name
                  params: (NSDictionary *) params)

RCT_EXTERN_METHOD(properties:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
    return true;
}

@end
