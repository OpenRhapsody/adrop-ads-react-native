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

    func refreshLayout() {
        setNeedsLayout()
        layoutIfNeeded()
    }

    private func constrainGADMediaView() {
        findAndConstrainMediaView(in: self)

        if let superview = superview {
            for sibling in superview.subviews {
                let className = String(describing: type(of: sibling))
                if className.contains("NativeAdView") || className.contains("GAD") {
                    findAndConstrainMediaView(in: sibling)
                }
            }

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

        if className.contains("MediaView") && !className.contains("RNAdrop") {
            disableAspectRatioConstraints(on: view)

            view.frame = CGRect(origin: view.frame.origin, size: expectedSize)
            view.clipsToBounds = true
            view.layer.masksToBounds = true
            view.contentMode = .scaleAspectFill

            constrainChildrenRecursively(view, depth: 0)
            return
        }

        for subview in view.subviews {
            findAndConstrainMediaView(in: subview)
        }
    }

    private func disableAspectRatioConstraints(on view: UIView) {
        var disabledCount = 0

        for constraint in view.constraints {
            if (constraint.firstAttribute == .height && constraint.secondAttribute == .width) ||
               (constraint.firstAttribute == .width && constraint.secondAttribute == .height) {
                constraint.isActive = false
                disabledCount += 1
            }
        }

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
