// New Architecture (Fabric) host view for the Adrop native ad container.
//
// Provides the Fabric plumbing (descriptor, props, performClick command) and
// reuses the bridge-optional Swift `RNAdropNativeAdView` for the ad lifecycle.
// Asset views are collected from the mounted subtree and classified by
// `assetRole`, then bound to the core SDK ad view.

#ifdef RCT_NEW_ARCH_ENABLED

#import "AdropNativeAdComponentView.h"

#import <react/renderer/components/AdropAdsReactNativeSpec/ComponentDescriptors.h>
#import <react/renderer/components/AdropAdsReactNativeSpec/Props.h>
#import <react/renderer/components/AdropAdsReactNativeSpec/RCTComponentViewHelpers.h>

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <React/RCTView.h>
#import <WebKit/WebKit.h>
// <AdropAds/AdropAds-Swift.h> (generated Swift→ObjC header) only exists at this path
// for framework/dynamic AdropAds builds (e.g. the published `adrop-ads` pod). A static
// / from-source build (local podspec) does not emit it there and fails with
// "AdropAds/AdropAds-Swift.h not found". This file uses no AdropAds Swift type directly
// (RNAdropNativeAdView is forward-declared below), so guard with __has_include: present
// → use it, absent → skip. Builds in both setups — no need to revert for the published pod.
#if __has_include(<AdropAds/AdropAds-Swift.h>)
#import <AdropAds/AdropAds-Swift.h>
#endif

#import "AdropNativeAssetComponentView.h"

// RNAdropNativeAdView is a Swift @objc(RNAdropNativeAdView) class. Swift does NOT
// emit RCTView subclasses into the generated -Swift.h in static-library builds (it
// cannot re-export the React module into that header), and framework builds put the
// header on a different path — so importing the generated Swift header is unreliable
// across linkages and across the publisher's chosen integration. Declare the ObjC
// interface we use here instead. The explicit @objc name pins the runtime class so
// the reference resolves at link time.
@class RCTBridge;
@interface RNAdropNativeAdView : RCTView
- (instancetype)initWithBridge:(RCTBridge *_Nullable)bridge;
- (void)setNativeAdRequestId:(NSString *_Nullable)requestId;
- (void)bindAsset:(UIView *_Nonnull)view role:(NSString *_Nonnull)role;
- (void)performClick:(NSString *_Nonnull)requestId;
@end

using namespace facebook::react;

@interface AdropNativeAdComponentView () <RCTAdropNativeAdViewViewProtocol>
@end

@implementation AdropNativeAdComponentView {
    RNAdropNativeAdView *_adView;
    NSString *_requestId;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<AdropNativeAdViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const AdropNativeAdViewProps>();
        _props = defaultProps;

        // bridge-less: Fabric has no RCTBridge; asset binding goes through
        // mountChildComponentView instead of bridge.uiManager.
        _adView = [[RNAdropNativeAdView alloc] initWithBridge:nil];
        self.contentView = _adView;
    }
    return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<const AdropNativeAdViewProps>(_props);
    const auto &newViewProps = *std::static_pointer_cast<const AdropNativeAdViewProps>(props);

    if (oldViewProps.nativeAdRequestId != newViewProps.nativeAdRequestId &&
        !newViewProps.nativeAdRequestId.empty()) {
        _requestId = RCTNSStringFromString(newViewProps.nativeAdRequestId);
    }

    [super updateProps:props oldProps:oldProps];
}

#pragma mark - Asset binding (Fabric)

// Bind after the mounting transaction settles, so all asset wrappers are present.
- (void)finalizeUpdates:(RNComponentViewUpdateMask)updateMask
{
    [super finalizeUpdates:updateMask];

    if (_requestId == nil || _requestId.length == 0) {
        return;
    }

    [self bindAssetsInView:self];
    // setNativeAd attaches the ad and registers the bound asset views for
    // impression/click tracking (same SDK path as the Old Architecture).
    [_adView setNativeAdRequestId:_requestId];
}

- (void)bindAssetsInView:(UIView *)view
{
    for (UIView *sub in view.subviews) {
        if ([sub isKindOfClass:[AdropNativeAssetComponentView class]]) {
            AdropNativeAssetComponentView *asset = (AdropNativeAssetComponentView *)sub;
            if (asset.assetRole != nil) {
                [_adView bindAsset:asset role:asset.assetRole];
            }
        }
        [self bindAssetsInView:sub];
    }
}

#pragma mark - RCTAdropNativeAdViewViewProtocol (command, no uiManager lookup)

- (void)performClick
{
    if (_requestId != nil) {
        [_adView performClick:_requestId];
    }
}

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args
{
    RCTAdropNativeAdViewHandleCommand(self, commandName, args);
}

@end

// Fabric component registration (matched by name "AdropNativeAdView").
Class<RCTComponentViewProtocol> AdropNativeAdViewCls(void)
{
    return AdropNativeAdComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
