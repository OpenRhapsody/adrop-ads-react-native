import React, { useEffect, useRef } from 'react'
import { BackHandler, Platform, StyleSheet, Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import GuideScreen from '../screens/GuideScreen'
import DeveloperScreen from '../screens/DeveloperScreen'
import AdManager from '../services/AdManager'
import { Colors } from '../theme/colors'

const Tab = createBottomTabNavigator()

const TabIcon: React.FC<{ label: string; color: string }> = ({
    label,
    color,
}) => <Text style={[styles.tabIcon, { color }]}>{label}</Text>

const renderGuideIcon = ({ color }: { color: string }) => (
    <TabIcon label="G" color={color} />
)

const renderDeveloperIcon = ({ color }: { color: string }) => (
    <TabIcon label="D" color={color} />
)

const MainTabNavigator: React.FC = () => {
    const showedPopup = useRef(false)

    useEffect(() => {
        if (!showedPopup.current) {
            showedPopup.current = true
            setTimeout(() => {
                AdManager.showStartupPopup()
            }, 500)
        }

        if (Platform.OS === 'android') {
            const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                () => {
                    AdManager.showExitInterstitial(() => {
                        BackHandler.exitApp()
                    })
                    return true
                }
            )
            return () => backHandler.remove()
        }
        return undefined
    }, [])

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textSecondary,
                tabBarStyle: { backgroundColor: Colors.white },
                tabBarLabelStyle: { fontSize: 12 },
            }}
        >
            <Tab.Screen
                name="Guide"
                component={GuideScreen}
                options={{
                    tabBarIcon: renderGuideIcon,
                }}
            />
            <Tab.Screen
                name="Developer"
                component={DeveloperScreen}
                options={{
                    tabBarIcon: renderDeveloperIcon,
                }}
            />
        </Tab.Navigator>
    )
}

const styles = StyleSheet.create({
    tabIcon: {
        fontSize: 10,
        fontWeight: 'bold',
    },
})

export default MainTabNavigator
