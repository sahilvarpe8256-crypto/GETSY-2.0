/**
 * GETSY 2.0 — Product Catalog Data
 * Aligned with backend Product model, API contract, and design references.
 *
 * CATEGORY NORMALIZATION: All product categories use canonical IDs from
 * ai/src/data/categories.js. Former 'ornaments' → 'accessories',
 * 'hardware' → 'home', 'furniture' → 'home'.
 */

export const products = [
  {
    id: 'prod-1',
    name: 'Pune Leather Formal Shoes',
    category: 'footwear',
    categoryLabel: 'Footwear',
    price: 2499,
    originalPrice: 3299,
    stock: 12,
    stockStatus: 'In Stock',
    shopId: 'shop-1',
    shopName: 'Kothrud Shoes & Boots',
    shopLocation: 'Kothrud Shoes & Boots, Pune',
    distance: '1.4 km',
    imageType: 'formal_shoes',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80',
    verified: true,
    inStorePickup: true,
    availableSizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    description: 'Handcrafted premium leather formal shoes designed for all-day comfort and long-lasting durability. Features a padded insole, genuine full-grain leather upper, and anti-skid rubber sole.',
    attributes: { color: 'brown', style: 'formal', material: 'leather', size: null },
    rating: 4.8,
    reviewsCount: 34,
    reviews: [
      {
        id: 'rev-101',
        userName: 'Vikram Joshi',
        rating: 5,
        date: '2 days ago',
        comment: 'Exceptional leather quality! Picked it up directly from the Kothrud store. Fits true to size.'
      },
      {
        id: 'rev-102',
        userName: 'Anand Patil',
        rating: 4,
        date: '1 week ago',
        comment: 'Very comfortable sole and great finish for office wear. Highly recommended.'
      }
    ]
  },
  {
    id: 'prod-2',
    name: 'Temple Design Necklace',
    category: 'accessories',
    categoryLabel: 'Accessories',
    price: 48500,
    originalPrice: 52000,
    stock: 1,
    stockStatus: 'Low Stock (1 left)',
    shopId: 'shop-2',
    shopName: 'Om Jewellers',
    shopLocation: 'Om Jewellers, Sarafa Bazaar',
    distance: '0.8 km',
    imageType: 'temple_necklace',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
    verified: true,
    inStorePickup: true,
    availableSizes: ['Standard', 'Large'],
    description: 'A handcrafted temple design necklace featuring intricate traditional motifs, layered chains and a centered gemstone pendant. Made by skilled local artisans at Om Jewellers, this piece blends heritage craftsmanship with a refined contemporary finish — perfect for festive occasions and timeless everyday elegance.',
    attributes: { color: 'gold', style: 'traditional', material: 'gold', size: null },
    rating: 4.9,
    reviewsCount: 19,
    reviews: [
      {
        id: 'rev-201',
        userName: 'Pooja Kulkarni',
        rating: 5,
        date: '3 days ago',
        comment: 'Breathtaking craftsmanship! The temple motifs are so sharp and elegant. Got verified certification at the shop.'
      },
      {
        id: 'rev-202',
        userName: 'Sneha Deshmukh',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Authentic hallmark design and warm in-store experience at Sarafa Bazaar.'
      }
    ]
  },
  {
    id: 'prod-3',
    name: 'Oxidised Anklets',
    category: 'accessories',
    categoryLabel: 'Accessories',
    price: 899,
    originalPrice: 1199,
    stock: 15,
    stockStatus: 'In Stock',
    shopId: 'shop-2',
    shopName: 'Om Jewellers',
    shopLocation: 'Om Jewellers, Sarafa Bazaar',
    distance: '0.8 km',
    imageType: 'anklets',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
    verified: true,
    inStorePickup: true,
    availableSizes: ['Free Size', 'Adjustable'],
    description: 'Traditional handcrafted 92.5 oxidised silver-finish anklets with subtle chime bells and ethnic detailing. Lightweight and skin-friendly coating.',
    attributes: { color: 'silver', style: 'ethnic', material: 'silver', size: null },
    rating: 4.6,
    reviewsCount: 28,
    reviews: [
      {
        id: 'rev-301',
        userName: 'Radhika Shinde',
        rating: 5,
        date: 'Yesterday',
        comment: 'Super pretty! The bells give a sweet chime and it looks beautiful with ethnic sarees.'
      }
    ]
  },
  {
    id: 'prod-4',
    name: 'Runner Sneakers',
    category: 'footwear',
    categoryLabel: 'Footwear',
    price: 1499,
    originalPrice: 1999,
    stock: 8,
    stockStatus: 'In Stock',
    shopId: 'shop-3',
    shopName: "Rahul's Footwear",
    shopLocation: "Rahul's Footwear, Panchavati",
    distance: '2.1 km',
    imageType: 'runner_sneakers',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    verified: true,
    inStorePickup: true,
    availableSizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
    description: 'High-performance athletic running shoes engineered with breathable mesh fabric, lightweight EVA cushioning, and shock absorption for daily jogs and sports.',
    attributes: { color: null, style: 'sports', material: null, size: null },
    rating: 4.8,
    reviewsCount: 42,
    reviews: [
      {
        id: 'rev-401',
        userName: 'Rohan Gaikwad',
        rating: 5,
        date: '4 days ago',
        comment: 'Great arch support and super lightweight. Very good deal for local shop purchase.'
      }
    ]
  },
  {
    id: 'prod-5',
    name: 'Designer High-Top Shoes',
    category: 'footwear',
    categoryLabel: 'Footwear',
    price: 999,
    originalPrice: 1499,
    stock: 5,
    stockStatus: 'In Stock',
    shopId: 'shop-4',
    shopName: 'Urban Streetwear Hub',
    shopLocation: 'Urban Streetwear Hub, Near Painted Road',
    distance: '3.0 km',
    imageType: 'designer_shoes',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
    verified: true,
    inStorePickup: true,
    availableSizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
    description: 'Iconic red and white high-top lifestyle sneakers. Combines bold streetwear fashion with padded ankle collars and durable stitch construction.',
    attributes: { color: 'red', style: 'casual', material: null, size: null },
    rating: 4.7,
    reviewsCount: 51,
    reviews: [
      {
        id: 'rev-501',
        userName: 'Sahil More',
        rating: 5,
        date: '5 days ago',
        comment: 'Looks just like the photo. The red and white color blocking is striking.'
      }
    ]
  },
  {
    id: 'prod-6',
    name: 'Kundan Gold-Plated Earrings',
    category: 'accessories',
    categoryLabel: 'Accessories',
    price: 349,
    originalPrice: 599,
    stock: 2,
    stockStatus: 'Low Stock (2 left)',
    shopId: 'shop-2',
    shopName: 'Om Jewellers',
    shopLocation: 'Om Jewellers, Sarafa Bazaar',
    distance: '0.8 km',
    imageType: 'earrings',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80',
    verified: true,
    inStorePickup: true,
    availableSizes: ['Standard Drop'],
    description: 'Intricate ethnic Kundan drop earrings plated with 24k gold finish and embellished with faux pearls and enamel work.',
    attributes: { color: 'gold', style: 'ethnic', material: 'gold', size: null },
    rating: 4.7,
    reviewsCount: 16,
    reviews: [
      {
        id: 'rev-601',
        userName: 'Tanvi Thorat',
        rating: 5,
        date: '6 days ago',
        comment: 'Light on the ears and very festive looking! Amazing price.'
      }
    ]
  },
  {
    id: 'prod-7',
    name: 'Pure Cotton Casual Shirt',
    category: 'clothing',
    categoryLabel: 'Clothing',
    price: 1199,
    originalPrice: 1699,
    stock: 20,
    stockStatus: 'In Stock',
    shopId: 'shop-5',
    shopName: 'Pune Trends',
    shopLocation: 'Pune Trends, Market Yard, Pune',
    distance: '3.1 km',
    imageType: 'clothing',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    verified: true,
    inStorePickup: true,
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: '100% breathable organic cotton shirt with structured collar and tailored slim fit. Perfect for smart casual office and weekend wear.',
    attributes: { color: null, style: 'casual', material: 'cotton', size: null },
    rating: 4.6,
    reviewsCount: 39,
    reviews: [
      {
        id: 'rev-701',
        userName: 'Mayur Jagtap',
        rating: 5,
        date: '1 week ago',
        comment: 'Soft fabric, fits nicely across shoulders. Nice color.'
      }
    ]
  },
  {
    id: 'prod-8',
    name: 'Solid Teak Lounge Chair',
    category: 'home',
    categoryLabel: 'Home',
    price: 6499,
    originalPrice: 8500,
    stock: 4,
    stockStatus: 'In Stock',
    shopId: 'shop-6',
    shopName: 'Kopargaon Furnishers',
    shopLocation: 'Kopargaon Furnishers, Main Road',
    distance: '2.5 km',
    imageType: 'furniture',
    image: 'https://images.unsplash.com/photo-1580481077198-c8478645998b?w=600&auto=format&fit=crop&q=80',
    verified: true,
    inStorePickup: true,
    availableSizes: ['Standard Armchair'],
    description: 'Handcrafted solid teakwood armchair with ergonomic curved backrest and water-repellent cushioned seating.',
    attributes: { color: null, style: null, material: 'wood', size: null },
    rating: 4.8,
    reviewsCount: 14,
    reviews: [
      {
        id: 'rev-801',
        userName: 'Amit Bhandari',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Sturdy wood finish and comfortable cushioning. Prompt in-store pickup.'
      }
    ]
  },
  {
    id: 'prod-9',
    name: 'Fresh Organic Farm Apples (1kg)',
    category: 'grocery',
    categoryLabel: 'Grocery',
    price: 180,
    originalPrice: 220,
    stock: 50,
    stockStatus: 'In Stock',
    shopId: 'shop-7',
    shopName: 'Sangamner Supermart',
    shopLocation: 'Sangamner Supermart, Station Road',
    distance: '1.8 km',
    imageType: 'grocery',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
    verified: true,
    inStorePickup: true,
    availableSizes: ['1 kg pack', '2 kg pack'],
    description: 'Crisp, sweet mountain-grown apples sourced directly from local orchard farms. Chemical-free and rich in fiber.',
    attributes: { color: null, style: null, material: null, size: null },
    rating: 4.9,
    reviewsCount: 88,
    reviews: [
      {
        id: 'rev-901',
        userName: 'Neeta Kale',
        rating: 5,
        date: 'Today',
        comment: 'Super fresh and juicy apples. Picked up within 15 mins at Station Road.'
      }
    ]
  },
  {
    id: 'prod-10',
    name: 'Wireless ANC Headphones',
    category: 'electronics',
    categoryLabel: 'Electronics',
    price: 3499,
    originalPrice: 4999,
    stock: 7,
    stockStatus: 'In Stock',
    shopId: 'shop-8',
    shopName: 'Nashik Digital',
    shopLocation: 'Nashik Digital, MG Road',
    distance: '3.2 km',
    imageType: 'electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    verified: true,
    inStorePickup: true,
    availableSizes: ['Matte Black', 'Silver Grey'],
    description: 'Active noise cancelling Bluetooth 5.3 over-ear headphones with 40-hour battery life, fast USB-C charging, and deep bass sound drivers.',
    attributes: { color: 'black', style: null, material: null, size: null },
    rating: 4.7,
    reviewsCount: 63,
    reviews: [
      {
        id: 'rev-1001',
        userName: 'Kunal Sonawane',
        rating: 5,
        date: '3 days ago',
        comment: 'Great noise cancellation for the price. The staff at Nashik Digital helped set up warranty.'
      }
    ]
  },
  {
    id: 'prod-11',
    name: 'Precision Heavy-Duty Cordless Drill',
    category: 'home',
    categoryLabel: 'Home',
    price: 2899,
    originalPrice: 3600,
    stock: 6,
    stockStatus: 'In Stock',
    shopId: 'shop-9',
    shopName: 'Sangamner Hardware Traders',
    shopLocation: 'Sangamner Hardware Traders, Old Bazaar',
    distance: '1.1 km',
    imageType: 'hardware',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
    verified: true,
    inStorePickup: true,
    availableSizes: ['12V Kit', '18V Pro Kit'],
    description: 'High-torque cordless power drill with 2-speed gearbox, 20 torque settings, LED work light, and rechargeable lithium-ion battery pack.',
    attributes: { color: null, style: null, material: 'metal', size: null },
    rating: 4.8,
    reviewsCount: 22,
    reviews: [
      {
        id: 'rev-1101',
        userName: 'Dinesh Shinde',
        rating: 5,
        date: '5 days ago',
        comment: 'Solid build and battery lasts through long home renovation tasks.'
      }
    ]
  },
  {
    id: 'prod-12',
    name: 'Classic Leather Travel Wallet',
    category: 'accessories',
    categoryLabel: 'Accessories',
    price: 699,
    originalPrice: 999,
    stock: 18,
    stockStatus: 'In Stock',
    shopId: 'shop-1',
    shopName: 'Kothrud Shoes & Boots',
    shopLocation: 'Kothrud Shoes & Boots, Pune',
    distance: '1.4 km',
    imageType: 'accessories',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
    verified: true,
    inStorePickup: true,
    availableSizes: ['Tan Brown', 'Dark Walnut'],
    description: 'Slim RFID-protected genuine leather bifold wallet with 8 card slots, currency divider, and coin pocket.',
    attributes: { color: 'brown', style: 'classic', material: 'leather', size: null },
    rating: 4.6,
    reviewsCount: 31,
    reviews: [
      {
        id: 'rev-1201',
        userName: 'Pravin Pawar',
        rating: 5,
        date: '1 week ago',
        comment: 'Neat stitching and fits easily in front pocket without bulk.'
      }
    ]
  }
];

export function getProductById(id) {
  return products.find((p) => p.id === id || String(p.id) === String(id)) || null;
}

const LEGACY_CATEGORY_ALIASES = {
  ornaments: 'accessories',
  hardware: 'home',
  furniture: 'home'
};

export function filterProducts({ category, search, shopId, minPrice, maxPrice, sortBy }) {
  let list = [...products];

  if (category && category !== 'all') {
    const raw = category.toLowerCase().trim();
    const norm = LEGACY_CATEGORY_ALIASES[raw] || raw;
    list = list.filter((p) => p.category.toLowerCase() === norm);
  }

  if (shopId) {
    const sId = String(shopId).toLowerCase().trim();
    list = list.filter((p) => {
      const pShopId = String(p.shopId).toLowerCase().trim();
      return (
        pShopId === sId ||
        pShopId === `shop-${sId}` ||
        `shop-${pShopId}` === sId ||
        (pShopId.startsWith('shop-') && pShopId.replace('shop-', '') === sId)
      );
    });
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shopName.toLowerCase().includes(q) ||
        p.shopLocation.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (minPrice !== undefined && minPrice !== null) {
    list = list.filter((p) => p.price >= Number(minPrice));
  }

  if (maxPrice !== undefined && maxPrice !== null) {
    list = list.filter((p) => p.price <= Number(maxPrice));
  }

  if (sortBy === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  }

  return list;
}
