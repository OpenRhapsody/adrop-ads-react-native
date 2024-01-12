import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'

import BannerExample from './views/BannerExample'
import Home from './views/Home'
import InterstitialAdHookExample from './views/InterstitialAdHookExample'
import InterstitialAdClassExample from './views/InterstitialAdClassExample'
import RewardedAdHookExample from './views/RewardedAdHookExample'
import RewardedAdClassExample from './views/RewardedAdClassExample'

const Stack = createStackNavigator()

export default function App() {
    return (
        <NavigationContainer>
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
            </Stack.Navigator>
        </NavigationContainer>
    )
}
