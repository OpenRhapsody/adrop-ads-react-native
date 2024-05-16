#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(AdropMetrics, RCTEventEmitter)

RCT_EXTERN_METHOD(setProperty:(NSString *)key
                  value: (NSString *) value)

RCT_EXTERN_METHOD(logEvent:(NSString *)name
                  params: (NSDictionary *) params)

+ (BOOL)requiresMainQueueSetup
{
    return true;
}

@end
