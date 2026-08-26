/**
 * GETSY 2.0 — Standalone AI Search Demo
 * =====================================
 * Demonstrates deterministic rule-based natural language understanding
 * and product search against in-memory mock data.
 *
 * Run with:
 *   npm run demo (from ai/)
 *   or: node ai/demo.js (from repository root)
 */

const { RuleBasedProvider } = require('./src');

const provider = new RuleBasedProvider();

const DEMO_QUERIES = [
  // 1. Exact Target Query
  'I need black formal shoes under 2000 near Sangamner',

  // 2. Sneakers with max price
  'white sneakers under 3000',

  // 3. Material & item
  'leather wallet',

  // 4. Category & location
  'shirts in Sangamner',

  // 5. Shop search intent
  'shops near Pune',

  // 6. Color, style, price
  'blue jeans under 1500',

  // 7. Browse category intent
  'show me electronics',

  // 8. Multi-attribute query (color, material, size)
  'find me a red cotton shirt size L'
];

async function runDemo() {
  console.log('================================================================');
  console.log('             GETSY 2.0 AI SEARCH ENGINE DEMO                    ');
  console.log('       ₹0 Deterministic Rule-Based NLP (Offline)                ');
  console.log('================================================================\n');

  for (let i = 0; i < DEMO_QUERIES.length; i++) {
    const query = DEMO_QUERIES[i];
    console.log(`----------------------------------------------------------------`);
    console.log(`[Demo Case ${i + 1}/${DEMO_QUERIES.length}]`);
    console.log(`QUERY: "${query}"`);
    console.log(`----------------------------------------------------------------`);

    if (query.includes('shops')) {
      const result = await provider.searchShops(query);
      console.log('PARSED STRUCTURED QUERY:');
      console.log(JSON.stringify(result.structuredQuery, null, 2));
      console.log(`\nMATCHING SHOPS (${result.total} found):`);
      if (result.shops.length > 0) {
        result.shops.forEach((s) => {
          console.log(`  * [${s.id}] ${s.name} (${s.category}) — City: ${s.city} (Lat: ${s.location.latitude}, Lng: ${s.location.longitude})`);
        });
      } else {
        console.log('  * (No shops matched this query)');
      }
    } else {
      const result = await provider.search(query);
      console.log('PARSED STRUCTURED QUERY:');
      console.log(JSON.stringify(result.structuredQuery, null, 2));
      console.log(`\nMATCHING PRODUCTS (${result.total} found):`);
      if (result.products.length > 0) {
        result.products.forEach((p) => {
          console.log(`  * [${p.id}] ${p.name} — ₹${p.price} | Category: ${p.category} | Shop: ${p.shopName}`);
          console.log(`    Attributes: ${JSON.stringify(p.attributes)}`);
        });
      } else {
        console.log('  * (No products matched this query)');
      }
    }

    console.log('\n');
  }

  console.log('================================================================');
  console.log('                   DEMO COMPLETED SUCCESSFULLY                  ');
  console.log('================================================================');
}

runDemo().catch((err) => {
  console.error('Demo encountered an error:', err);
  process.exit(1);
});
