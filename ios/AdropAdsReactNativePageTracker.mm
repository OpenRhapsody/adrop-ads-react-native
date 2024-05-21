#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AdropPageTracker, NSObject)


RCT_EXTERN_METHOD(track:(NSString *)page
                  sizeOfRoutes:(NSInteger) sizeOfRoutes)

RCT_EXTERN_METHOD(attach:(NSString *)page
                  unitId:(NSString) unitId)

+ (BOOL)requiresMainQueueSetup
{
    return true;
}


@end
