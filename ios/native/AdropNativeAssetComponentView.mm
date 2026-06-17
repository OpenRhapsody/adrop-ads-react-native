// Fabric (New Architecture) wrapper for a single native-ad asset.
// Carries `assetRole` so the enclosing AdropNativeAdComponentView can classify
// and bind it to the core SDK ad view.

#ifdef RCT_NEW_ARCH_ENABLED

#import "AdropNativeAssetComponentView.h"

#import <react/renderer/components/AdropAdsReactNativeSpec/ComponentDescriptors.h>
#import <react/renderer/components/AdropAdsReactNativeSpec/Props.h>

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

using namespace facebook::react;

@implementation AdropNativeAssetComponentView

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<AdropNativeAssetViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const AdropNativeAssetViewProps>();
        _props = defaultProps;
    }
    return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &newViewProps = *std::static_pointer_cast<const AdropNativeAssetViewProps>(props);
    self.assetRole = RCTNSStringFromString(newViewProps.assetRole);
    self.nativeAdRequestId = RCTNSStringFromString(newViewProps.nativeAdRequestId);
    [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> AdropNativeAssetViewCls(void)
{
    return AdropNativeAssetComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
