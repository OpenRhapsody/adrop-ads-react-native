package io.adrop

import com.facebook.react.bridge.ReactApplicationContext
import io.adrop.specs.NativeAdropRewardedAdSpec

/** New Architecture base: real TurboModule via codegen `NativeAdropRewardedAdSpec`. */
abstract class AdropRewardedAdModuleSpec(context: ReactApplicationContext) :
    NativeAdropRewardedAdSpec(context)
