import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { Colors } from '../theme/colors'
import type { ShoppingProduct } from './ShoppingProduct'
import { getDiscountedPrice, formatPrice } from './ShoppingProduct'

interface ShoppingProductCardProps {
    product: ShoppingProduct
    onPress: () => void
}

const ShoppingProductCard: React.FC<ShoppingProductCardProps> = ({
    product,
    onPress,
}) => {
    const discountedPrice = getDiscountedPrice(product)

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Image
                source={{ uri: product.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <Text style={styles.brand}>{product.brand}</Text>
                <Text
                    style={styles.name}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {product.name}
                </Text>

                <View style={styles.priceRow}>
                    {product.discountRate > 0 && (
                        <Text style={styles.discountRate}>
                            {product.discountRate}%
                        </Text>
                    )}
                    <Text style={styles.price}>
                        {formatPrice(discountedPrice)}won
                    </Text>
                </View>

                {product.discountRate > 0 && (
                    <Text style={styles.originalPrice}>
                        {formatPrice(product.price)}won
                    </Text>
                )}

                <View style={styles.ratingRow}>
                    <Text style={styles.star}>★</Text>
                    <Text style={styles.rating}>{product.rating}</Text>
                    <Text style={styles.reviewCount}>
                        ({formatPrice(product.reviewCount)})
                    </Text>
                </View>

                {product.tags.length > 0 && (
                    <View style={styles.tagsRow}>
                        {product.tags.map((tag, index) => (
                            <View key={index} style={styles.tagChip}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        marginHorizontal: 4,
        marginVertical: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 180,
    },
    content: {
        padding: 10,
    },
    brand: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    name: {
        fontSize: 13,
        color: Colors.textPrimary,
        marginBottom: 6,
        lineHeight: 18,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    discountRate: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF4444',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    originalPrice: {
        fontSize: 11,
        color: Colors.textSecondary,
        textDecorationLine: 'line-through',
        marginTop: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 2,
    },
    star: {
        fontSize: 12,
        color: '#FFB800',
    },
    rating: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
    reviewCount: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 4,
    },
    tagChip: {
        backgroundColor: '#F0F4FF',
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    tagText: {
        fontSize: 10,
        color: Colors.primary,
    },
})

export default ShoppingProductCard
