package io.adrop

import com.facebook.react.bridge.ReactApplicationContext
import io.adrop.specs.NativeAdropNativeAdSpec

/** New Architecture base: real TurboModule via codegen `NativeAdropNativeAdSpec`. */
abstract class AdropNativeAdModuleSpec(context: ReactApplicationContext) :
    NativeAdropNativeAdSpec(context)
