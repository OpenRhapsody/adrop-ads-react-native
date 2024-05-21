import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'

import {
    BannerExample,
    Home,
    InterstitialAdClassExample,
    InterstitialAdHookExample,
    PropertyExample,
    RewardedAdClassExample,
    RewardedAdHookExample,
} from './views'
import { AdropNavigatorObserver } from 'adrop-ads-react-native'

const Stack = createStackNavigator()

export default function App() {
    return (
        <NavigationContainer
            onStateChange={AdropNavigatorObserver.onStateChange}
        >
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={Home} />
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
                    name="PropertyExample"
                    component={PropertyExample}
                />
            </Stack.Navigator>
        </NavigationContainer>
    )
}
