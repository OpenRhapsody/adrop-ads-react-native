export interface ShoppingProduct {
    id: string
    name: string
    brand: string
    price: number
    discountRate: number
    imageUrl: string
    rating: number
    reviewCount: number
    tags: string[]
}

export const getDiscountedPrice = (product: ShoppingProduct): number =>
    Math.floor((product.price * (100 - product.discountRate)) / 100)

export const formatPrice = (price: number): string =>
    price.toLocaleString('en-US')

export const dummyProducts: ShoppingProduct[] = [
    {
        id: 'shop_001',
        name: 'Premium Wireless Earphone Pro Max',
        brand: 'SoundTech',
        price: 189000,
        discountRate: 35,
        imageUrl: 'https://picsum.photos/seed/earphone/400/400',
        rating: 4.8,
        reviewCount: 2341,
        tags: ['Free Shipping', 'Ships Today'],
    },
    {
        id: 'shop_002',
        name: 'Organic Cotton Oversized Sweatshirt',
        brand: 'DailyWear',
        price: 49900,
        discountRate: 20,
        imageUrl: 'https://picsum.photos/seed/sweater/400/400',
        rating: 4.5,
        reviewCount: 876,
        tags: ['Free Shipping'],
    },
    {
        id: 'shop_003',
        name: 'Smart Air Purifier 2nd Gen',
        brand: 'CleanAir',
        price: 299000,
        discountRate: 40,
        imageUrl: 'https://picsum.photos/seed/purifier/400/400',
        rating: 4.7,
        reviewCount: 1523,
        tags: ['Free Shipping', 'Sale'],
    },
    {
        id: 'shop_004',
        name: 'Retro Mini Bluetooth Speaker',
        brand: 'RetroSound',
        price: 68000,
        discountRate: 15,
        imageUrl: 'https://picsum.photos/seed/speaker/400/400',
        rating: 4.3,
        reviewCount: 432,
        tags: ['Ships Today'],
    },
    {
        id: 'shop_005',
        name: 'Genuine Leather Mini Crossbody Bag',
        brand: 'LeatherCraft',
        price: 129000,
        discountRate: 25,
        imageUrl: 'https://picsum.photos/seed/bag/400/400',
        rating: 4.6,
        reviewCount: 1089,
        tags: ['Free Shipping', 'Limited'],
    },
    {
        id: 'shop_006',
        name: 'Ultra Light AirMax Running Shoes',
        brand: 'RunFast',
        price: 159000,
        discountRate: 30,
        imageUrl: 'https://picsum.photos/seed/shoes/400/400',
        rating: 4.9,
        reviewCount: 3210,
        tags: ['Free Shipping', 'Best Seller'],
    },
]
