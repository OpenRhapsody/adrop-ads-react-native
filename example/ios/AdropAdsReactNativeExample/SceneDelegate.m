#import "SceneDelegate.h"
#import <React/RCTBridge.h>
#import <React/RCTRootView.h>
#import <React/RCTBundleURLProvider.h>

@implementation SceneDelegate

- (void)scene:(UIScene*)scene
    willConnectToSession:(UISceneSession*)session
                 options:(UISceneConnectionOptions*)connectionOptions {
    if (![scene isKindOfClass:[UIWindowScene class]]) {
        return;
    }

    UIWindowScene *windowScene = (UIWindowScene *)scene;

    RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:nil];
    RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"AdropAdsReactNativeExample" initialProperties:nil];

    self.window = [[UIWindow alloc] initWithWindowScene:windowScene];

    UIViewController *rootViewController = [UIViewController new];
    rootViewController.view = rootView;

   AdropSplashAdViewController *splashViewController = [[AdropSplashAdViewController alloc] initWithUnitId:@"PUBLIC_TEST_UNIT_ID_SPLASH"];
   splashViewController.backgroundColor = [UIColor colorWithWhite:1.0 alpha:1.0];
   splashViewController.logoImage = [UIImage imageNamed:@"splashLogo"];
   splashViewController.mainViewController = rootViewController;
   splashViewController.timeout = 0.5;
   splashViewController.delegate = self;

   self.window.rootViewController = splashViewController;
    [self.window makeKeyAndVisible];
}

- (void)sceneDidDisconnect:(UIScene *)scene { }

- (void)sceneDidBecomeActive:(UIScene *)scene { }

- (void)sceneWillResignActive:(UIScene *)scene { }

- (void)sceneWillEnterForeground:(UIScene *)scene { }

- (void)sceneDidEnterBackground:(UIScene *)scene { }

#pragma mark - AdropSplashAdDelegate

- (void)onAdReceived:(AdropSplashAd *)ad {
   NSLog(@"onAdReceived %@", ad.unitId);
}

- (void)onAdFailedToReceive:(AdropSplashAd *)ad :(AdropErrorCode)errorCode {
   NSLog(@"onAdFailedToReceive: %@ error: ", ad.unitId);
}

- (void)onAdImpression:(AdropSplashAd *)ad {
   NSLog(@"onAdImpression: %@", ad.unitId);
}

#pragma mark - RCTBridgeDelegate

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
#if DEBUG
    return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
    return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
