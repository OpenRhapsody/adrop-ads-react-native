import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Adrop } from 'adrop-ads-react-native'

import SplashScreen from './screens/SplashScreen'
import MainTabNavigator from './navigation/MainTabNavigator'
import AdManager from './services/AdManager'

import {
    BannerExample,
    ConsentExample,
    InterstitialAdClassExample,
    InterstitialAdHookExample,
    PopupAdClassExample,
    PropertyExample,
    RewardedAdClassExample,
    RewardedAdHookExample,
} from './views'
import NativeAdExample from './views/NativeAdExample'
import { ShoppingAdExampleScreen, ShoppingAdDetailScreen } from './shopping'

const Stack = createStackNavigator()

type AppPhase = 'splash' | 'main'

export default function App() {
    const [phase, setPhase] = useState<AppPhase>('splash')

    useEffect(() => {
        Adrop.initialize(false)
        AdManager.preloadStartupPopup()
        AdManager.preloadExitInterstitial()
    }, [])

    const handleSplashComplete = () => {
        setPhase('main')
    }

    if (phase === 'splash') {
        return <SplashScreen onComplete={handleSplashComplete} />
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="MainTabs"
                    component={MainTabNavigator}
                    options={{ headerShown: false }}
                />
                {/* Developer test screens (navigated from Developer tab) */}
                <Stack.Screen name="BannerExample" component={BannerExample} />
                <Stack.Screen
                    name="InterstitialAdHookExample"
                    component={InterstitialAdHookExample}
                />
                <Stack.Screen
                    name="InterstitialAdClassExample"
                    component={InterstitialAdClassExample}
                />
                <Stack.Screen
                    name="RewardedAdHookExample"
                    component={RewardedAdHookExample}
                />
                <Stack.Screen
                    name="RewardedAdClassExample"
                    component={RewardedAdClassExample}
                />
                <Stack.Screen
                    name="PopupAdClassExample"
                    component={PopupAdClassExample}
                />
                <Stack.Screen
                    name="NativeAdExample"
                    component={NativeAdExample}
                />
                <Stack.Screen
                    name="PropertyExample"
                    component={PropertyExample}
                />
                <Stack.Screen
                    name="ConsentExample"
                    component={ConsentExample}
                />
                <Stack.Screen
                    name="ShoppingAdExample"
                    component={ShoppingAdExampleScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ShoppingAdDetail"
                    component={ShoppingAdDetailScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    )
}
