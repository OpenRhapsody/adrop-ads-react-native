import UIKit
import React
import AdropAds

/// Host for a banner pre-loaded by `AdropBanner.loads()`.
///
/// Detach-only lifecycle (re-attach contract): this view never destroys the
/// banner and never touches its delegate — lifetime is owned by
/// `AdropBanner.destroyLoaded()` and events stay routed through the
/// AdropBanner module. Deliberate opposite of `AdropBannerViewWrapper`
/// (which creates its own banner), hence a separate manager.
@objc
class AdropPreloadedBannerView: RCTView {
    private var banner: AdropBanner?

    override func layoutSubviews() {
        super.layoutSubviews()
        // Only size the banner while we actually own it: with the re-attach
        // contract another host may have stolen it, and writing our bounds
        // onto its frame there mis-sizes it — a wrong frame shrinks the
        // measured visible area and silently kills impressions.
        // `bounds`, not `frame`: frame would additionally offset the child by
        // this wrapper's own origin (see AdropBannerViewWrapper.layoutSubviews).
        guard let banner = banner, banner.superview === self else { return }
        banner.frame = bounds
    }

    @objc
    func setRequestId(_ requestId: NSString) {
        guard let banner = AdropPreloadedBannerStore.instance.banners[requestId as String] else {
            return
        }
        // Evict this host's previous banner first. React reuses the host view
        // and only pushes the changed `requestId` prop (state swap / key={index}),
        // so the view is never dropped — without this the old banner stays a
        // subview, hidden under the new one but still visibility-tracked and
        // playing video (occlusion is invisible to ViewVisibilityUtils), and
        // `self.banner` no longer points at it so layoutSubviews stops sizing it.
        // Detach only: its lifetime stays with AdropBanner.destroyLoaded().
        // Evict only what THIS host still owns: `self.banner` may since have
        // been stolen by another host (list reorder / duplicate mount), and
        // removing it from there would blank that host's slot.
        // Mirrors Android AdropPreloadedBannerHostView.attach().
        for subview in subviews where subview !== banner {
            subview.removeFromSuperview()
        }
        self.banner = banner
        // Steal from the previous host; skip when we already own it so a
        // repeated prop set doesn't churn detach/re-attach
        // (Android's `if (banner.parent === this) return`).
        if banner.superview !== self {
            banner.removeFromSuperview()
            addSubview(banner)
        }
    }
}

@objc(AdropPreloadedBannerViewManager)
class AdropPreloadedBannerViewManager: RCTViewManager {

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func view() -> AdropPreloadedBannerView? {
        return AdropPreloadedBannerView()
    }
}
