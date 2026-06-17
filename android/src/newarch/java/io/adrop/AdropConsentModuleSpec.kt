package io.adrop

import com.facebook.react.bridge.ReactApplicationContext
import io.adrop.specs.NativeAdropConsentSpec

/** New Architecture base: real TurboModule via codegen `NativeAdropConsentSpec`. */
abstract class AdropConsentModuleSpec(context: ReactApplicationContext) :
    NativeAdropConsentSpec(context)
