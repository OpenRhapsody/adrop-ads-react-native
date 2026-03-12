import React from 'react'
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Colors } from '../theme/colors'
import type { ShoppingProduct } from './ShoppingProduct'
import { getDiscountedPrice, formatPrice } from './ShoppingProduct'

const ShoppingAdDetailScreen: React.FC = () => {
    const navigation = useNavigation()
    const route = useRoute<any>()
    const product: ShoppingProduct = route.params.product

    const discountedPrice = getDiscountedPrice(product)

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Product Image Section */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: product.imageUrl }}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>{'✕'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Product Info Section */}
                <View style={styles.productInfoSection}>
                    <Text style={styles.brand}>{product.brand}</Text>
                    <Text style={styles.productName}>{product.name}</Text>

                    {/* Rating Row */}
                    <View style={styles.ratingRow}>
                        <Text style={styles.stars}>{'★★★★★'}</Text>
                        <Text style={styles.ratingValue}>{product.rating}</Text>
                        <Text style={styles.reviewCount}>
                            {product.reviewCount} reviews
                        </Text>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Price Row */}
                    <View style={styles.priceRow}>
                        <Text style={styles.discountRate}>
                            {product.discountRate}%
                        </Text>
                        <View style={styles.priceColumn}>
                            <Text style={styles.originalPrice}>
                                {formatPrice(product.price)}won
                            </Text>
                            <Text style={styles.discountedPrice}>
                                {formatPrice(discountedPrice)}won
                            </Text>
                        </View>
                    </View>

                    {/* Tags Row */}
                    <View style={styles.tagsRow}>
                        {product.tags.map((tag: string, index: number) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Delivery Info Section */}
                <View style={styles.deliverySection}>
                    <Text style={styles.sectionHeader}>Delivery Info</Text>
                    <View style={styles.deliveryRow}>
                        <Text style={styles.deliveryLabel}>Shipping</Text>
                        <Text style={styles.deliveryValue}>Free</Text>
                    </View>
                    <View style={styles.deliveryRowSpaced}>
                        <Text style={styles.deliveryLabel}>Arrival</Text>
                        <Text style={styles.deliveryArrivalValue}>
                            Tomorrow (Wed)
                        </Text>
                    </View>
                </View>

                {/* Seller Section */}
                <View style={styles.sellerSection}>
                    <Text style={styles.sectionHeader}>Seller</Text>
                    <View style={styles.sellerRow}>
                        <View style={styles.sellerAvatar} />
                        <View style={styles.sellerInfo}>
                            <Text style={styles.sellerName}>
                                {product.brand}
                            </Text>
                            <Text style={styles.sellerBadge}>
                                Official Store
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Spacer for bottom bar clearance */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Bottom Purchase Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.wishlistButton}
                    onPress={() => Alert.alert('Added to wishlist')}
                >
                    <Text style={styles.wishlistIcon}>{'☆'}</Text>
                </TouchableOpacity>
                <View style={styles.verticalDivider} />
                <TouchableOpacity
                    style={styles.purchaseButton}
                    onPress={() =>
                        Alert.alert(
                            'Purchase',
                            product.name +
                                '\n' +
                                formatPrice(discountedPrice) +
                                'won'
                        )
                    }
                >
                    <Text style={styles.purchaseButtonText}>Purchase</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        flex: 1,
    },

    // Product Image Section
    imageContainer: {
        width: '100%',
        height: 360,
    },
    productImage: {
        width: '100%',
        height: 360,
    },
    backButton: {
        position: 'absolute',
        top: 12,
        left: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    backButtonText: {
        fontSize: 18,
        color: Colors.textPrimary,
    },

    // Product Info Section
    productInfoSection: {
        backgroundColor: Colors.white,
        padding: 16,
    },
    brand: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginTop: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    stars: {
        fontSize: 14,
        color: '#FFB800',
    },
    ratingValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginLeft: 6,
    },
    reviewCount: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginLeft: 6,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.divider,
        marginVertical: 16,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    discountRate: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FF4444',
    },
    priceColumn: {
        marginLeft: 12,
    },
    originalPrice: {
        fontSize: 13,
        color: Colors.textSecondary,
        textDecorationLine: 'line-through',
    },
    discountedPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    tagsRow: {
        flexDirection: 'row',
        marginTop: 12,
    },
    tag: {
        backgroundColor: '#F0F4FF',
        borderRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginRight: 8,
    },
    tagText: {
        fontSize: 12,
        color: Colors.primary,
    },

    // Delivery Info Section
    deliverySection: {
        backgroundColor: Colors.white,
        padding: 16,
        marginTop: 8,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    deliveryRow: {
        flexDirection: 'row',
        marginTop: 12,
    },
    deliveryRowSpaced: {
        flexDirection: 'row',
        marginTop: 8,
    },
    deliveryLabel: {
        width: 80,
        fontSize: 13,
        color: Colors.textSecondary,
    },
    deliveryValue: {
        fontSize: 13,
        color: Colors.textPrimary,
    },
    deliveryArrivalValue: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.primary,
    },

    // Seller Section
    sellerSection: {
        backgroundColor: Colors.white,
        padding: 16,
        marginTop: 8,
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    sellerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
    },
    sellerInfo: {
        marginLeft: 12,
    },
    sellerName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    sellerBadge: {
        fontSize: 12,
        color: Colors.textSecondary,
    },

    // Bottom Spacer
    bottomSpacer: {
        height: 80,
    },

    // Bottom Purchase Bar
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 12,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    wishlistButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wishlistIcon: {
        fontSize: 24,
        color: Colors.textPrimary,
    },
    verticalDivider: {
        width: 1,
        height: 32,
        backgroundColor: Colors.divider,
        marginHorizontal: 8,
    },
    purchaseButton: {
        flex: 1,
        height: 52,
        backgroundColor: Colors.primary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    purchaseButtonText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: Colors.white,
    },
})

export default ShoppingAdDetailScreen
