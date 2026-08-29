/**
 * GETSY 2.0 — Product Categories & Synonym Map
 * ----------------------------------------------
 * Each canonical category maps to an array of lowercase synonym strings.
 * The parser matches query tokens against this map to resolve categories.
 *
 * To add a new category: append a key with its synonyms.
 * Existing consumers will pick it up automatically.
 */

const CATEGORIES = {
  footwear: [
    'shoe', 'shoes', 'sneaker', 'sneakers', 'sandal', 'sandals',
    'slipper', 'slippers', 'boot', 'boots', 'heel', 'heels',
    'loafer', 'loafers', 'chappal', 'chappals', 'footwear',
    'jogger', 'joggers', 'floater', 'floaters', 'flip-flop', 'flip-flops',
  ],

  clothing: [
    'shirt', 'shirts', 't-shirt', 't-shirts', 'tshirt', 'tshirts',
    'pant', 'pants', 'trouser', 'trousers', 'jeans', 'jean',
    'dress', 'dresses', 'kurta', 'kurtas', 'saree', 'sarees', 'sari', 'saris',
    'jacket', 'jackets', 'hoodie', 'hoodies', 'sweater', 'sweaters',
    'top', 'tops', 'skirt', 'skirts', 'shorts', 'blazer', 'blazers',
    'clothing', 'clothes', 'garment', 'garments', 'apparel',
  ],

  electronics: [
    'phone', 'phones', 'mobile', 'mobiles', 'smartphone', 'smartphones',
    'laptop', 'laptops', 'tablet', 'tablets', 'headphone', 'headphones',
    'earphone', 'earphones', 'earbuds', 'earbud', 'charger', 'chargers',
    'camera', 'cameras', 'speaker', 'speakers', 'television', 'tv',
    'electronics', 'electronic', 'gadget', 'gadgets',
  ],

  accessories: [
    'wallet', 'wallets', 'belt', 'belts', 'watch', 'watches',
    'sunglasses', 'sunglass', 'bag', 'bags', 'purse', 'purses',
    'backpack', 'backpacks', 'handbag', 'handbags', 'cap', 'caps',
    'hat', 'hats', 'scarf', 'scarves', 'tie', 'ties',
    'accessory', 'accessories', 'jewellery', 'jewelry',
    'bracelet', 'bracelets', 'necklace', 'necklaces', 'ring', 'rings',
  ],

  grocery: [
    'grocery', 'groceries', 'vegetable', 'vegetables', 'fruit', 'fruits',
    'rice', 'wheat', 'dal', 'oil', 'sugar', 'salt', 'spice', 'spices',
    'atta', 'flour', 'milk', 'bread', 'egg', 'eggs',
  ],

  beauty: [
    'beauty', 'cosmetic', 'cosmetics', 'makeup', 'skincare',
    'lipstick', 'foundation', 'cream', 'lotion', 'shampoo',
    'conditioner', 'perfume', 'fragrance', 'serum',
  ],

  sports: [
    'sport', 'sports', 'cricket', 'football', 'badminton',
    'bat', 'ball', 'racket', 'gym', 'fitness', 'yoga',
    'dumbbell', 'treadmill', 'sportswear',
  ],

  books: [
    'book', 'books', 'novel', 'novels', 'textbook', 'textbooks',
    'notebook', 'notebooks', 'stationery', 'pen', 'pens',
    'pencil', 'pencils', 'diary', 'diaries',
  ],

  home: [
    'furniture', 'sofa', 'table', 'chair', 'bed', 'mattress',
    'curtain', 'curtains', 'pillow', 'pillows', 'lamp', 'lamps',
    'decor', 'decoration', 'home', 'kitchen', 'utensil', 'utensils',
  ],
};

module.exports = { CATEGORIES };
