package io.adrop

import com.facebook.react.bridge.ReactApplicationContext
import io.adrop.specs.NativeAdropMetricsSpec

/** New Architecture base: real TurboModule via codegen `NativeAdropMetricsSpec`. */
abstract class AdropMetricsModuleSpec(context: ReactApplicationContext) :
    NativeAdropMetricsSpec(context)
