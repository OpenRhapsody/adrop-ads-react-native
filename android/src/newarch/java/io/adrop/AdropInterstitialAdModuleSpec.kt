package io.adrop

import com.facebook.react.bridge.ReactApplicationContext
import io.adrop.specs.NativeAdropInterstitialAdSpec

/** New Architecture base: real TurboModule via codegen `NativeAdropInterstitialAdSpec`. */
abstract class AdropInterstitialAdModuleSpec(context: ReactApplicationContext) :
    NativeAdropInterstitialAdSpec(context)
