/**
 * True when the New Architecture (Fabric renderer) is active.
 *
 * `nativeFabricUIManager` is installed on the JS global only when the Fabric
 * renderer is initialised, so its presence is a reliable runtime signal that
 * does not depend on a native module. Returns false under the Old Architecture
 * and in Jest.
 */
export const isFabricEnabled =
    (global as unknown as { nativeFabricUIManager?: unknown })
        ?.nativeFabricUIManager != null
