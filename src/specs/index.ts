import { NativeModules, TurboModuleRegistry } from 'react-native'

/**
 * Resolves a native module by name in an architecture-agnostic way.
 *
 * - New Architecture: `TurboModuleRegistry.get` returns the codegen-backed
 *   TurboModule.
 * - Old Architecture (and Jest): `get` returns `null`, so we fall back to the
 *   legacy `NativeModules` entry. This keeps the existing Bridge path working
 *   unchanged while making the JS layer ready for the New Architecture.
 *
 * Returns `undefined` when the module is unavailable (e.g. the backfill module
 * is not installed), matching the previous `NativeModules.X` lookup semantics
 * so existing null-checks keep working.
 */
export function getNativeModule<T = any>(name: string): T | undefined {
    return (TurboModuleRegistry.get(name) ?? NativeModules[name]) as
        | T
        | undefined
}
