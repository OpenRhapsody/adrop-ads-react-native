package io.adrop.native

import android.content.Context
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import io.adrop.ads.nativeAd.AdropMediaView

class AdropMediaViewManager(private val context: Context) :
    SimpleViewManager<RNAdropMediaView>() {

    override fun getName(): String = "MediaView"

    override fun createViewInstance(context: ThemedReactContext): RNAdropMediaView {
        return RNAdropMediaView(context)
    }
}
