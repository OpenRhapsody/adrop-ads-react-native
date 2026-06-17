package io.adrop

import com.facebook.react.bridge.ReactApplicationContext
import io.adrop.specs.NativeAdropAdsSpec

/** New Architecture base: real TurboModule via codegen `NativeAdropAdsSpec`. */
abstract class AdropAdsModuleSpec(context: ReactApplicationContext) :
    NativeAdropAdsSpec(context)
