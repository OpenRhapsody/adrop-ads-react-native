package io.adrop.native

import android.content.Context
import android.util.AttributeSet
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import io.adrop.ads.nativeAd.AdropMediaView

class RNAdropMediaView(context: Context, attrs: AttributeSet? = null) : AdropMediaView(context, attrs) {

    init {
        requestLayout()

        // Monitor hierarchy changes to detect when AdMob adds its MediaView content
        setOnHierarchyChangeListener(object : ViewGroup.OnHierarchyChangeListener {
            override fun onChildViewAdded(parent: View?, child: View?) {
                // Force layout when AdMob adds MediaView child
                child?.post {
                    if (width > 0 && height > 0) {
                        child.measure(
                            MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
                            MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
                        )
                        child.layout(0, 0, width, height)
                    }
                }
            }

            override fun onChildViewRemoved(parent: View?, child: View?) {
            }
        })
    }

    private val measureAndLayout: Runnable = Runnable {
        measure(
            MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
        )
        layout(left, top, right, bottom)
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)

        // Force layout all children recursively
        val w = right - left
        val h = bottom - top
        forceLayoutChildren(this, w, h)

        post(measureAndLayout)
    }

    private fun forceLayoutChildren(parent: ViewGroup, w: Int, h: Int) {
        for (i in 0 until parent.childCount) {
            val child = parent.getChildAt(i)

            // Always force layout for all children
            child.layoutParams = child.layoutParams ?: FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )

            child.measure(
                MeasureSpec.makeMeasureSpec(w, MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(h, MeasureSpec.EXACTLY)
            )
            child.layout(0, 0, w, h)

            // Force visibility for all children
            child.visibility = View.VISIBLE

            // If child is a ViewGroup, recurse
            if (child is ViewGroup) {
                forceLayoutChildren(child, w, h)
            }
        }
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        requestLayout()
    }
}
