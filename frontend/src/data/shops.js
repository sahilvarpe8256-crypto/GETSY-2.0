/**
 * GETSY 2.0 — Shop Catalog Data
 * Canonical shop dataset used consistently across Home, DiscoverShops, /shops, ShopMap, and ShopDetail.
 */

export const shops = [
  {
    id: 'shop-1',
    numericId: 1,
    name: 'Kothrud Shoes & Boots',
    category: 'FOOTWEAR',
    categoryLabel: 'Footwear',
    address: 'Shop 12, Paud Road, Kothrud',
    area: 'Kothrud',
    city: 'Pune',
    distance: '1.4 km',
    coordinates: { lat: 18.5074, lng: 73.8077 },
    verified: true,
    rating: 4.8,
    reviewsCount: 52,
    itemsCount: 24,
    phone: '+91 98230 11223',
    openingHours: '9:30 AM - 9:00 PM',
    isOpen: true,
    imageType: 'footwear',
    description: 'Premier neighborhood footwear boutique in Kothrud specializing in handcrafted leather formal shoes, casual sneakers, running gear, and authentic leather accessories. In-store fitting and repair services available.'
  },
  {
    id: 'shop-2',
    numericId: 2,
    name: 'Om Jewellers',
    category: 'ORNAMENTS',
    categoryLabel: 'Ornaments',
    address: '142 Sarafa Bazaar, Laxmi Road',
    area: 'Sarafa Bazaar',
    city: 'Pune',
    distance: '0.8 km',
    coordinates: { lat: 18.5167, lng: 73.8562 },
    verified: true,
    rating: 4.9,
    reviewsCount: 68,
    itemsCount: 45,
    phone: '+91 98224 44556',
    openingHours: '10:30 AM - 8:30 PM',
    isOpen: true,
    imageType: 'ornaments',
    description: 'Trusted family jewelers with over 30 years of excellence. Renowned for authentic 92.5 oxidised silver ornaments, hallmark 24k gold-plated jewelry, temple necklaces, and customized bridal sets.'
  },
  {
    id: 'shop-3',
    numericId: 3,
    name: "Rahul's Footwear",
    category: 'FOOTWEAR',
    categoryLabel: 'Footwear',
    address: 'Near Panchavati Karanja',
    area: 'Panchavati',
    city: 'Nashik',
    distance: '2.1 km',
    coordinates: { lat: 19.9975, lng: 73.7898 },
    verified: true,
    rating: 4.7,
    reviewsCount: 38,
    itemsCount: 19,
    phone: '+91 94231 77889',
    openingHours: '10:00 AM - 9:30 PM',
    isOpen: true,
    imageType: 'footwear',
    description: 'Specialized athletic sports and casual footwear store featuring top brands, runner sneakers, everyday sandals, and supportive comfort insoles for all ages.'
  },
  {
    id: 'shop-4',
    numericId: 4,
    name: 'Urban Streetwear Hub',
    category: 'FOOTWEAR',
    categoryLabel: 'Footwear',
    address: '45 Painted Road, FC Road Corner',
    area: 'Shivajinagar',
    city: 'Pune',
    distance: '3.0 km',
    coordinates: { lat: 18.5284, lng: 73.8423 },
    verified: true,
    rating: 4.7,
    reviewsCount: 51,
    itemsCount: 32,
    phone: '+91 98812 33445',
    openingHours: '11:00 AM - 10:00 PM',
    isOpen: true,
    imageType: 'footwear',
    description: 'Trendsetting youth fashion destination with limited edition high-top sneakers, skater shoes, graphic street apparel, and urban accessories.'
  },
  {
    id: 'shop-5',
    numericId: 5,
    name: 'Pune Trends',
    category: 'CLOTHING',
    categoryLabel: 'Clothing',
    address: 'Shop 8, Market Yard Commercial Complex',
    area: 'Market Yard',
    city: 'Pune',
    distance: '3.1 km',
    coordinates: { lat: 18.4892, lng: 73.8679 },
    verified: true,
    rating: 4.6,
    reviewsCount: 44,
    itemsCount: 58,
    phone: '+91 98900 55667',
    openingHours: '10:00 AM - 9:00 PM',
    isOpen: true,
    imageType: 'clothing',
    description: 'Contemporary apparel store bringing you pure organic cotton casual shirts, formal trousers, ethnic kurtas, and seasonal fashion collections at wholesale-direct prices.'
  },
  {
    id: 'shop-6',
    numericId: 6,
    name: 'Kopargaon Furnishers',
    category: 'HARDWARE',
    categoryLabel: 'Hardware',
    address: 'Near Old Bus Stand, Main Road',
    area: 'Main Road',
    city: 'Kopargaon',
    distance: '2.5 km',
    coordinates: { lat: 19.8921, lng: 74.4789 },
    verified: true,
    rating: 4.8,
    reviewsCount: 29,
    itemsCount: 16,
    phone: '+91 98221 88990',
    openingHours: '9:00 AM - 8:30 PM',
    isOpen: true,
    imageType: 'furniture',
    description: 'Expert woodwork and architectural hardware specialists offering solid teakwood furnishings, door handles, brass hinges, and modular interior fittings.'
  },
  {
    id: 'shop-7',
    numericId: 7,
    name: 'Sangamner Supermart',
    category: 'ACCESSORIES',
    categoryLabel: 'Accessories',
    address: 'Near Railway Station, Station Road',
    area: 'Station Road',
    city: 'Sangamner',
    distance: '1.8 km',
    coordinates: { lat: 19.5768, lng: 74.2145 },
    verified: true,
    rating: 4.9,
    reviewsCount: 94,
    itemsCount: 65,
    phone: '+91 94222 66778',
    openingHours: '8:00 AM - 10:00 PM',
    isOpen: true,
    imageType: 'grocery',
    description: 'All-in-one local mart offering travel bags, personal accessories, wallets, daily essentials, and fresh regional produce with express pickup.'
  },
  {
    id: 'shop-8',
    numericId: 8,
    name: 'Nashik Digital',
    category: 'ACCESSORIES',
    categoryLabel: 'Accessories',
    address: '22 MG Road, Near Circle',
    area: 'MG Road',
    city: 'Nashik',
    distance: '3.2 km',
    coordinates: { lat: 19.9975, lng: 73.7905 },
    verified: true,
    rating: 4.7,
    reviewsCount: 72,
    itemsCount: 40,
    phone: '+91 98233 44551',
    openingHours: '10:00 AM - 9:30 PM',
    isOpen: true,
    imageType: 'electronics',
    description: 'Multi-brand digital hub featuring noise-cancelling headphones, smartwatch straps, smartphone accessories, audio gear, and electronic cables with genuine warranties.'
  },
  {
    id: 'shop-9',
    numericId: 9,
    name: 'Sangamner Hardware Traders',
    category: 'HARDWARE',
    categoryLabel: 'Hardware',
    address: 'Plot 15, Old Bazaar Market',
    area: 'Old Bazaar',
    city: 'Sangamner',
    distance: '1.1 km',
    coordinates: { lat: 19.5780, lng: 74.2120 },
    verified: true,
    rating: 4.8,
    reviewsCount: 36,
    itemsCount: 28,
    phone: '+91 94237 99001',
    openingHours: '8:30 AM - 8:30 PM',
    isOpen: true,
    imageType: 'hardware',
    description: 'Comprehensive industrial and home improvement supplier stocking power tools, cordless drills, plumbing fittings, paints, safety gear, and precision fasteners.'
  }
];

/**
 * Retrieve shop by id (canonical 'shop-1', numeric 1, string '1', etc.)
 */
export function getShopById(id) {
  if (!id) return null;
  const strId = String(id).toLowerCase().trim();
  return shops.find(
    (s) =>
      s.id.toLowerCase() === strId ||
      String(s.numericId) === strId ||
      `shop-${s.numericId}`.toLowerCase() === strId ||
      s.name.toLowerCase() === strId
  ) || null;
}

/**
 * Filter shops by category, search query, distance, and verified status
 */
export function filterShops({ category, search, maxDistance, verifiedOnly }) {
  let list = [...shops];

  if (category && category !== 'all') {
    const normCat = category.toLowerCase().trim();
    list = list.filter((s) => s.category.toLowerCase() === normCat);
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.area.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }

  if (verifiedOnly) {
    list = list.filter((s) => s.verified);
  }

  if (maxDistance && maxDistance !== 'all') {
    list = list.filter((s) => {
      const distNum = parseFloat(s.distance);
      return isNaN(distNum) || distNum <= Number(maxDistance);
    });
  }

  return list;
}
