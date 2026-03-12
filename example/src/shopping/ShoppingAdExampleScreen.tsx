import React, { useState } from 'react'
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Colors } from '../theme/colors'
import type { ShoppingProduct } from './ShoppingProduct'
import { dummyProducts } from './ShoppingProduct'
import ShoppingProductCard from './ShoppingProductCard'

const tabs = ['All', 'Popular', 'New']

const ShoppingAdExampleScreen: React.FC = () => {
    const navigation = useNavigation<any>()
    const [selectedTab, setSelectedTab] = useState('All')

    const handleProductPress = (product: ShoppingProduct) => {
        navigation.navigate('ShoppingAdDetail', { product })
    }

    const renderItem = ({ item }: { item: ShoppingProduct }) => (
        <ShoppingProductCard
            product={item}
            onPress={() => handleProductPress(item)}
        />
    )

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.closeButton}>{'✕'}</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Shopping Ad</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Tab Section */}
            <View style={styles.tabContainer}>
                {tabs.map((tab) => {
                    const isSelected = selectedTab === tab
                    return (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                isSelected
                                    ? styles.tabSelected
                                    : styles.tabDefault,
                            ]}
                            onPress={() => setSelectedTab(tab)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    isSelected
                                        ? styles.tabTextSelected
                                        : styles.tabTextDefault,
                                ]}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Product Grid */}
            <FlatList
                data={dummyProducts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id ?? item.name}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.white,
    },
    closeButton: {
        fontSize: 18,
        color: Colors.textPrimary,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginLeft: 12,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.divider,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: Colors.white,
        gap: 8,
    },
    tab: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    tabSelected: {
        backgroundColor: 'rgba(108,92,231,0.1)',
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    tabDefault: {
        backgroundColor: '#F0F0F0',
    },
    tabText: {
        fontSize: 14,
    },
    tabTextSelected: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    tabTextDefault: {
        color: Colors.textSecondary,
    },
    listContent: {
        padding: 8,
    },
    columnWrapper: {
        gap: 8,
    },
})

export default ShoppingAdExampleScreen
