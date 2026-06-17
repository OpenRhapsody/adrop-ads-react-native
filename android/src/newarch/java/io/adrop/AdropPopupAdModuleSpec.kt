package io.adrop

import com.facebook.react.bridge.ReactApplicationContext
import io.adrop.specs.NativeAdropPopupAdSpec

/** New Architecture base: real TurboModule via codegen `NativeAdropPopupAdSpec`. */
abstract class AdropPopupAdModuleSpec(context: ReactApplicationContext) :
    NativeAdropPopupAdSpec(context)
