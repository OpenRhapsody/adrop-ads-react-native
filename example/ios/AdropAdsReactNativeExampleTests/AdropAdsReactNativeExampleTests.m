#import <UIKit/UIKit.h>
#import <XCTest/XCTest.h>

#import <React/RCTLog.h>
#import <React/RCTRootView.h>

#define TIMEOUT_SECONDS 600
#define TEXT_TO_LOOK_FOR @"Welcome to React"

@interface AdropAdsReactNativeExampleTests : XCTestCase

@end

@implementation AdropAdsReactNativeExampleTests

- (BOOL)findSubviewInView:(UIView *)view matching:(BOOL (^)(UIView *view))test
{
  if (test(view)) {
    return YES;
  }
  for (UIView *subview in [view subviews]) {
    if ([self findSubviewInView:subview matching:test]) {
      return YES;
    }
  }
  return NO;
}

- (void)testRendersWelcomeScreen
{
  UIViewController *vc = [[[RCTSharedApplication() delegate] window] rootViewController];
  NSDate *date = [NSDate dateWithTimeIntervalSinceNow:TIMEOUT_SECONDS];
  BOOL foundElement = NO;

  __block NSString *redboxError = nil;
#ifdef DEBUG
  RCTSetLogFunction(
      ^(RCTLogLevel level, RCTLogSource source, NSString *fileName, NSNumber *lineNumber, NSString *message) {
        if (level >= RCTLogLevelError) {
          redboxError = message;
        }
      });
#endif

  while ([date timeIntervalSinceNow] > 0 && !foundElement && !redboxError) {
    [[NSRunLoop mainRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.1]];
    [[NSRunLoop mainRunLoop] runMode:NSRunLoopCommonModes beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.1]];

    foundElement = [self findSubviewInView:vc.view
                                  matching:^BOOL(UIView *view) {
                                    if ([view.accessibilityLabel isEqualToString:TEXT_TO_LOOK_FOR]) {
                                      return YES;
                                    }
                                    return NO;
                                  }];
  }

#ifdef DEBUG
  RCTSetLogFunction(RCTDefaultLogFunction);
#endif

  XCTAssertNil(redboxError, @"RedBox error: %@", redboxError);
  XCTAssertTrue(foundElement, @"Couldn't find element with text '%@' in %d seconds", TEXT_TO_LOOK_FOR, TIMEOUT_SECONDS);
}

#pragma mark - Banner layout regression guard

/// The banner is reached through the ObjC runtime because AdropBannerViewWrapper is internal to
/// the adrop-ads-react-native pod (a @testable import would require ENABLE_TESTABILITY and a
/// Swift file in this ObjC test target). Tries the module-qualified name Swift registers first.
- (Class)adropBannerWrapperClass
{
  Class cls = NSClassFromString(@"adrop_ads_react_native.AdropBannerViewWrapper");
  if (cls == nil) {
    cls = NSClassFromString(@"AdropBannerViewWrapper");
  }
  return cls;
}

/**
 * Guards the invariant that the banner child fills the wrapper.
 *
 * layoutSubviews must size the banner from `bounds`, not `frame`: `frame` is the wrapper's rect
 * in its *superview's* coordinate space, so assigning it to a child offsets the banner by the
 * wrapper's own origin. RN lays banners out at a non-zero origin whenever there are margins,
 * padding or siblings. That is not only cosmetic: the core SDK's ViewVisibilityUtils intersects
 * the banner against every superview's bounds regardless of clipsToBounds, and VisibilityTracker
 * needs >50% to report an impression — so the offset alone can silently suppress impressions on
 * direct ads, with AdMob backfill viewability penalised the same way.
 */
- (void)testBannerFillsWrapperBoundsWhenLaidOutAtNonZeroOrigin
{
  Class wrapperClass = [self adropBannerWrapperClass];
  XCTAssertNotNil(wrapperClass, @"AdropBannerViewWrapper not found in the ObjC runtime");

  SEL initSel = NSSelectorFromString(@"initWithBridge:");
  id allocated = [wrapperClass alloc];
  XCTAssertTrue([allocated respondsToSelector:initSel], @"initWithBridge: is not exposed to ObjC");

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Warc-performSelector-leaks"
  // nil bridge: the wrapper only uses it to emit JS events, which sendEvent already guards.
  UIView *wrapper = [allocated performSelector:initSel withObject:nil];

  SEL setUnitIdSel = NSSelectorFromString(@"setUnitId:");
  XCTAssertTrue([wrapper respondsToSelector:setUnitIdSel], @"setUnitId: is not exposed to ObjC");
  [wrapper performSelector:setUnitIdSel withObject:@"PUBLIC_TEST_UNIT_ID_320_50"];
#pragma clang diagnostic pop

  // A non-zero origin is the whole point — at origin (0,0) `frame` and `bounds` are identical
  // and the bug is invisible.
  wrapper.frame = CGRectMake(24, 100, 320, 50);
  [wrapper setNeedsLayout];
  [wrapper layoutIfNeeded];

  UIView *banner = wrapper.subviews.firstObject;
  XCTAssertNotNil(banner, @"setUnitId: should have added the AdropBanner as a subview");

  XCTAssertTrue(
      CGRectEqualToRect(banner.frame, wrapper.bounds),
      @"The banner must fill the wrapper's bounds, but was %@ (expected %@). layoutSubviews is "
      @"probably assigning `frame` instead of `bounds`, which offsets the ad by the wrapper's "
      @"own origin and can push it out of view.",
      NSStringFromCGRect(banner.frame),
      NSStringFromCGRect(wrapper.bounds));
}

@end
