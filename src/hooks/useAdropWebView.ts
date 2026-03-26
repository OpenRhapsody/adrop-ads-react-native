import { useCallback, useRef, useState } from 'react'
import { findNodeHandle } from 'react-native'
import type { View } from 'react-native'
import Adrop from '../Adrop'

const useAdropWebView = () => {
    const containerRef = useRef<View>(null)
    const [isReady, setIsReady] = useState(false)
    const registeredRef = useRef(false)

    const onLayout = useCallback(async () => {
        if (registeredRef.current) return
        if (containerRef.current) {
            const tag = findNodeHandle(containerRef.current)
            if (tag != null) {
                registeredRef.current = true
                await Adrop.registerWebView(tag)
                setIsReady(true)
            }
        }
    }, [])

    return { containerRef, isReady, onLayout }
}

export default useAdropWebView
