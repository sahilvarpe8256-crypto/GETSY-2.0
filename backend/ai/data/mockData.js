/**
 * GETSY 2.0 — Mock Product Data
 * --------------------------------
 * Standalone sample data for offline demos and testing.
 * No connection to MongoDB — this is purely in-memory.
 */

const MOCK_PRODUCTS = [
  {
    id: 'prod_001',
    name: 'Black Formal Shoes',
    category: 'footwear',
    price: 1800,
    attributes: { color: 'black', style: 'formal', material: 'leather' },
    shopId: 'shop_001',
    shopName: 'Sahil Footwear',
    location: { latitude: 19.57, longitude: 74.21 },
  },
  {
    id: 'prod_002',
    name: 'White Sports Sneakers',
    category: 'footwear',
    price: 2500,
    attributes: { color: 'white', style: 'sports' },
    shopId: 'shop_002',
    shopName: 'ActiveStep',
    location: { latitude: 18.52, longitude: 73.86 },
  },
  {
    id: 'prod_003',
    name: 'Red Cotton Shirt',
    category: 'clothing',
    price: 799,
    attributes: { color: 'red', material: 'cotton', size: 'L' },
    shopId: 'shop_003',
    shopName: 'FashionHub',
    location: { latitude: 19.57, longitude: 74.21 },
  },
  {
    id: 'prod_004',
    name: 'Leather Wallet',
    category: 'accessories',
    price: 650,
    attributes: { material: 'leather', color: 'brown' },
    shopId: 'shop_004',
    shopName: 'Classic Accessories',
    location: { latitude: 19.57, longitude: 74.21 },
  },
  {
    id: 'prod_005',
    name: 'Blue Denim Jeans',
    category: 'clothing',
    price: 1200,
    attributes: { color: 'blue', material: 'denim', style: 'casual' },
    shopId: 'shop_003',
    shopName: 'FashionHub',
    location: { latitude: 19.57, longitude: 74.21 },
  },
  {
    id: 'prod_006',
    name: 'Wireless Earbuds',
    category: 'electronics',
    price: 1500,
    attributes: { color: 'black' },
    shopId: 'shop_005',
    shopName: 'TechZone',
    location: { latitude: 18.52, longitude: 73.86 },
  },
  {
    id: 'prod_007',
    name: 'Brown Leather Belt',
    category: 'accessories',
    price: 450,
    attributes: { color: 'brown', material: 'leather' },
    shopId: 'shop_004',
    shopName: 'Classic Accessories',
    location: { latitude: 19.57, longitude: 74.21 },
  },
  {
    id: 'prod_008',
    name: 'Running Shoes',
    category: 'footwear',
    price: 3200,
    attributes: { style: 'sports', color: 'grey' },
    shopId: 'shop_002',
    shopName: 'ActiveStep',
    location: { latitude: 18.52, longitude: 73.86 },
  },
];

const MOCK_SHOPS = [
  {
    id: 'shop_001',
    name: 'Sahil Footwear',
    category: 'footwear',
    location: { latitude: 19.57, longitude: 74.21 },
    city: 'Sangamner',
  },
  {
    id: 'shop_002',
    name: 'ActiveStep',
    category: 'footwear',
    location: { latitude: 18.52, longitude: 73.86 },
    city: 'Pune',
  },
  {
    id: 'shop_003',
    name: 'FashionHub',
    category: 'clothing',
    location: { latitude: 19.57, longitude: 74.21 },
    city: 'Sangamner',
  },
  {
    id: 'shop_004',
    name: 'Classic Accessories',
    category: 'accessories',
    location: { latitude: 19.57, longitude: 74.21 },
    city: 'Sangamner',
  },
  {
    id: 'shop_005',
    name: 'TechZone',
    category: 'electronics',
    location: { latitude: 18.52, longitude: 73.86 },
    city: 'Pune',
  },
];

module.exports = { MOCK_PRODUCTS, MOCK_SHOPS };
