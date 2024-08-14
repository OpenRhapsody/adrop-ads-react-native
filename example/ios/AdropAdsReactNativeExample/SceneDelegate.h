#import <UIKit/UIKit.h>
#import <React/RCTBridgeDelegate.h>
#import <AdropAds/AdropAds.h>

@interface SceneDelegate : UIResponder <UIWindowSceneDelegate, RCTBridgeDelegate, AdropSplashAdDelegate>

@property (strong, nonatomic) UIWindow *window;

@end
