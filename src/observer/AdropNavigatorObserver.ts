import { NativeModules } from 'react-native'
import type { State } from './types'

class AdropNavigatorObserver {
    private static _current = ''
    private static _isRootAdded = false

    static get last() {
        return this._current
    }

    static onStateChange = (state: State | undefined) => {
        this.trackRootPage(state)

        const size = state?.routes.length ?? 0
        const route = size > 0 ? state?.routes[size - 1] : null
        this._current = route?.name ?? ''
        NativeModules.AdropPageTracker.track(this._current, size)
    }

    private static trackRootPage = (state: State | undefined) => {
        const stackSize = state?.routes.length ?? 0
        const root =
            state && stackSize > 1 ? state?.routes[stackSize - 2] : null
        if (this._isRootAdded || root == null) return
        this._isRootAdded = true

        NativeModules.AdropPageTracker.track(root?.name ?? '', stackSize - 1)
    }
}

export default AdropNavigatorObserver
