package io.adrop.native

import android.content.Context
import android.util.AttributeSet
import android.widget.FrameLayout
import io.adrop.ads.nativeAd.AdropMediaView

class RNAdropMediaView(context: Context, attrs: AttributeSet? = null) : AdropMediaView(context, attrs) {

    init {
        layoutParams = LayoutParams(
            LayoutParams.MATCH_PARENT,
            LayoutParams.WRAP_CONTENT
        )

        requestLayout()
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
        post(measureAndLayout)
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        requestLayout()
    }
}
