// New Architecture (Fabric) host view for the Adrop banner.
//
// This is the native side of the partner banner freeze fix: commands are
// delivered straight to this component view (`-load`/`-play`/`-pause`) with NO
// `bridge.uiManager.view(forReactTag:)` lookup, and events are emitted through
// the Fabric event emitter instead of the bridge-backed `BannerEventEmitter`.
//
// The Old Architecture path (AdropBannerViewManager + AdropBannerViewWrapper via
// the bridge) is untouched and still compiles when newArchEnabled=false.

#ifdef RCT_NEW_ARCH_ENABLED

#import "AdropBannerComponentView.h"

#import <react/renderer/components/AdropAdsReactNativeSpec/ComponentDescriptors.h>
#import <react/renderer/components/AdropAdsReactNativeSpec/EventEmitters.h>
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
// (AdropBannerViewWrapper is forward-declared below), so guard with __has_include:
// present → use it, absent → skip. Builds in both setups — no revert for the published pod.
#if __has_include(<AdropAds/AdropAds-Swift.h>)
#import <AdropAds/AdropAds-Swift.h>
#endif

// Swift wrapper (AdropBannerViewWrapper, @objc(AdropBannerViewWrapper)) — reused as
// the content view; it owns the core SDK AdropBanner + delegate and routes events
// via `onFabricEvent`. Swift does NOT emit RCTView subclasses into the generated
// -Swift.h in static-library builds, and framework builds put it on a different
// header path, so declare the ObjC interface we use here instead of importing that
// header. The explicit @objc name pins the runtime class for link-time resolution.
@class RCTBridge;
@interface AdropBannerViewWrapper : RCTView
- (instancetype)initWithBridge:(RCTBridge *_Nullable)bridge;
@property (nonatomic, copy, nullable) void (^onFabricEvent)(NSDictionary<NSString *, id> *body);
- (void)setUnitId:(NSString *_Nonnull)unitId;
- (void)setUseCustomClick:(BOOL)useCustomClick;
- (void)load;
- (void)play;
- (void)pause;
@end

using namespace facebook::react;

static std::string AdropStdString(id value)
{
    if (value == nil) {
        return std::string();
    }
    NSString *string = [value isKindOfClass:[NSString class]] ? value : [NSString stringWithFormat:@"%@", value];
    return std::string(string.UTF8String ?: "");
}

@interface AdropBannerComponentView () <RCTAdropBannerViewViewProtocol>
@end

@implementation AdropBannerComponentView {
    AdropBannerViewWrapper *_banner;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<AdropBannerViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const AdropBannerViewProps>();
        _props = defaultProps;

        _banner = [[AdropBannerViewWrapper alloc] initWithBridge:nil];

        __weak AdropBannerComponentView *weakSelf = self;
        _banner.onFabricEvent = ^(NSDictionary<NSString *, id> *body) {
            [weakSelf emitOnAdEvent:body];
        };

        self.contentView = _banner;
    }
    return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<const AdropBannerViewProps>(_props);
    const auto &newViewProps = *std::static_pointer_cast<const AdropBannerViewProps>(props);

    if (oldViewProps.useCustomClick != newViewProps.useCustomClick) {
        [_banner setUseCustomClick:newViewProps.useCustomClick];
    }

    // unitId is the trigger that creates the underlying AdropBanner, so set it last.
    if (oldViewProps.unitId != newViewProps.unitId && !newViewProps.unitId.empty()) {
        [_banner setUnitId:RCTNSStringFromString(newViewProps.unitId)];
    }

    [super updateProps:props oldProps:oldProps];
}

#pragma mark - RCTAdropBannerViewViewProtocol (commands, no uiManager lookup)

- (void)load { [_banner load]; }
- (void)play { [_banner play]; }
- (void)pause { [_banner pause]; }

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args
{
    RCTAdropBannerViewHandleCommand(self, commandName, args);
}

#pragma mark - Events

- (void)emitOnAdEvent:(NSDictionary<NSString *, id> *)body
{
    if (!_eventEmitter) {
        return;
    }
    auto emitter = std::static_pointer_cast<const AdropBannerViewEventEmitter>(_eventEmitter);

    AdropBannerViewEventEmitter::OnAdEvent event = {};
    event.method = AdropStdString(body[@"method"]);
    event.tag = [body[@"tag"] intValue];
    event.errorCode = AdropStdString(body[@"errorCode"]);
    event.creativeId = AdropStdString(body[@"creativeId"]);
    event.txId = AdropStdString(body[@"txId"]);
    event.campaignId = AdropStdString(body[@"campaignId"]);
    event.destinationURL = AdropStdString(body[@"destinationURL"]);
    event.browserTarget = [body[@"browserTarget"] intValue];
    event.creativeType = AdropStdString(body[@"creativeType"]);
    emitter->onAdEvent(event);
}

@end

// Fabric component registration (matched by name "AdropBannerView").
Class<RCTComponentViewProtocol> AdropBannerViewCls(void)
{
    return AdropBannerComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
