#import "SceneDelegate.h"
#import "AdropAdsReactNativeExample-Swift.h"
@import React_RCTAppDelegate;

@implementation SceneDelegate

- (void)scene:(UIScene*)scene
    willConnectToSession:(UISceneSession*)session
      options:(UISceneConnectionOptions*)connectionOptions {
    if (![scene isKindOfClass:[UIWindowScene class]]) {
        return;
    }

    UIWindowScene *windowScene = (UIWindowScene *)scene;

    // Build the React root from the shared factory (bridgeless / New Architecture),
    // NOT the legacy RCTBridge/RCTRootView. The RN 0.78 New Arch JS bundle requires
    // the bridgeless host (TurboModules); a legacy bridge here fails at bundle eval
    // with "TurboModuleRegistry.getEnforcing('PlatformConstants') could not be found"
    // → white screen.
    AppDelegate *appDelegate = (AppDelegate *)UIApplication.sharedApplication.delegate;
    UIView *rootView = [appDelegate.reactNativeFactory.rootViewFactory
        viewWithModuleName:@"AdropAdsReactNativeExample"
         initialProperties:nil
             launchOptions:nil];

    self.window = [[UIWindow alloc] initWithWindowScene:windowScene];

    [Adrop initializeWithProduction:false useInAppBrowser:false targetCountries:nil];

    UIViewController *rootViewController = [UIViewController new];
    rootViewController.view = rootView;

    AdropSplashAdViewController *splashViewController = [[AdropSplashAdViewController alloc] initWithUnitId:@"PUBLIC_TEST_UNIT_ID_SPLASH" adRequestTimeout:1];
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

@end
