import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { AdropConsent, AdropConsentStatus } from 'adrop-ads-react-native'
import { Colors } from '../theme/colors'

interface Props {
    onComplete: () => void
}

const SplashScreen: React.FC<Props> = ({ onComplete }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start()

        const timer = setTimeout(async () => {
            try {
                const status = await AdropConsent.getConsentStatus()
                if (
                    status === AdropConsentStatus.UNKNOWN ||
                    status === AdropConsentStatus.REQUIRED
                ) {
                    await AdropConsent.requestConsentInfoUpdate()
                }
            } catch (e) {
                console.log('Consent check failed:', e)
            }
            onComplete()
        }, 3000)

        return () => clearTimeout(timer)
    }, [onComplete, fadeAnim])

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <Text style={styles.title}>Adrop</Text>
                <Text style={styles.subtitle}>
                    AI-Powered Mobile Ad Platform
                </Text>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: Colors.white,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 8,
    },
})

export default SplashScreen
