import UIKit

class RNAdropMediaView: UIView {
    private var isLayouting = false
    private var expectedSize: CGSize = .zero

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupView()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupView()
    }

    private func setupView() {
        clipsToBounds = true
        layer.masksToBounds = true
    }

    override var frame: CGRect {
        didSet {
            // Store the expected size from React Native
            if frame.size.width > 0 && frame.size.height > 0 {
                expectedSize = frame.size
            }
        }
    }

    override func layoutSubviews() {
        super.layoutSubviews()

        guard expectedSize.width > 0 && expectedSize.height > 0 else { return }
        guard !isLayouting else { return }

        isLayouting = true
        constrainGADMediaView()
        isLayouting = false
    }

    private func constrainGADMediaView() {
        // Search from multiple starting points
        // 1. Search in self (direct children)
        findAndConstrainMediaView(in: self)

        // 2. Search in superview's siblings
        if let superview = superview {
            for sibling in superview.subviews {
                let className = String(describing: type(of: sibling))
                if className.contains("NativeAdView") || className.contains("GAD") {
                    findAndConstrainMediaView(in: sibling)
                }
            }

            // 3. Search in superview's superview (RNAdropNativeAdView -> AdropNativeAdView -> GADNativeAdView)
            if let grandSuperview = superview.superview {
                for sibling in grandSuperview.subviews {
                    let className = String(describing: type(of: sibling))
                    if className.contains("NativeAdView") || className.contains("GAD") {
                        findAndConstrainMediaView(in: sibling)
                    }
                }
            }
        }
    }

    private func findAndConstrainMediaView(in view: UIView) {
        let className = String(describing: type(of: view))

        // Check if this view is a MediaView
        if className.contains("MediaView") && !className.contains("RNAdrop") {

            // Disable aspect ratio constraints
            disableAspectRatioConstraints(on: view)

            // Force size
            view.frame = CGRect(origin: view.frame.origin, size: expectedSize)
            view.clipsToBounds = true
            view.layer.masksToBounds = true
            view.contentMode = .scaleAspectFill

            // Constrain all children
            constrainChildrenRecursively(view, depth: 0)
            return
        }

        // Recursively search
        for subview in view.subviews {
            findAndConstrainMediaView(in: subview)
        }
    }

    private func disableAspectRatioConstraints(on view: UIView) {
        var disabledCount = 0

        // Disable aspect ratio constraints on the view itself
        for constraint in view.constraints {
            if (constraint.firstAttribute == .height && constraint.secondAttribute == .width) ||
               (constraint.firstAttribute == .width && constraint.secondAttribute == .height) {
                constraint.isActive = false
                disabledCount += 1
            }
        }

        // Also check superview constraints
        if let superview = view.superview {
            for constraint in superview.constraints {
                if (constraint.firstItem === view || constraint.secondItem === view) {
                    if (constraint.firstAttribute == .height && constraint.secondAttribute == .width) ||
                       (constraint.firstAttribute == .width && constraint.secondAttribute == .height) {
                        constraint.isActive = false
                        disabledCount += 1
                    }
                }
            }
        }
    }

    private func constrainChildrenRecursively(_ view: UIView, depth: Int) {
        guard depth < 15 else { return }

        for child in view.subviews {
            child.frame = view.bounds
            child.clipsToBounds = true
            child.layer.masksToBounds = true
            child.contentMode = .scaleAspectFill

            constrainChildrenRecursively(child, depth: depth + 1)
        }
    }
}
