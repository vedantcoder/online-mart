/**
 * Unsplash Image Fetcher for Products 51-100
 *
 * This script:
 * 1. Queries Unsplash API for relevant images for products 51-100
 * 2. Fetches one image URL per product
 * 3. Generates SQL INSERT statements for product_images table
 *
 * Setup:
 * 1. Get a NEW Unsplash API key from https://unsplash.com/developers (different app)
 * 2. Run: npm install node-fetch
 * 3. Set your NEW API key below
 * 4. Run: node fetch-unsplash-images-51-100.js
 */

const UNSPLASH_ACCESS_KEY = "nChpjc1rsgzw4Gt7Fyq-DEJeJtZycg0To0rOuKqbgHc"; // Get from https://unsplash.com/developers

const products = [
  // PERSONAL CARE (20 products) - Products 51-70
  {
    id: 51,
    name: "Dove Intense Repair Shampoo 650ml",
    query: "dove shampoo haircare",
  },
  {
    id: 52,
    name: "Pantene Pro-V Silky Smooth 650ml",
    query: "pantene shampoo",
  },
  {
    id: 53,
    name: "Head & Shoulders Anti-Dandruff 650ml",
    query: "head shoulders shampoo",
  },
  {
    id: 54,
    name: "Lakme Absolute Matte Lipstick",
    query: "lakme lipstick cosmetics",
  },
  {
    id: 55,
    name: "Maybelline Fit Me Foundation",
    query: "maybelline foundation makeup",
  },
  {
    id: 56,
    name: "Nivea Soft Light Moisturizer 300ml",
    query: "nivea moisturizer cream",
  },
  {
    id: 57,
    name: "Vaseline Intensive Care Lotion 400ml",
    query: "vaseline lotion body",
  },
  {
    id: 58,
    name: "Ponds Age Miracle Cream 50g",
    query: "ponds cream skincare",
  },
  {
    id: 59,
    name: "Himalaya Neem Face Wash 150ml",
    query: "himalaya facewash neem",
  },
  {
    id: 60,
    name: "Garnier Skin Naturals Serum 30ml",
    query: "garnier serum vitamin c",
  },
  {
    id: 61,
    name: "Colgate Total Advanced Health 200g",
    query: "colgate toothpaste dental",
  },
  {
    id: 62,
    name: "Sensodyne Sensitivity Care 100g",
    query: "sensodyne toothpaste",
  },
  { id: 63, name: "Oral-B Pro-Health Toothbrush", query: "oral b toothbrush" },
  {
    id: 64,
    name: "Gillette Mach3 Razor + 2 Cartridges",
    query: "gillette razor mach3",
  },
  {
    id: 65,
    name: "Gillette Venus Razor for Women",
    query: "gillette venus razor women",
  },
  {
    id: 66,
    name: "Dettol Antiseptic Liquid 550ml",
    query: "dettol antiseptic disinfectant",
  },
  {
    id: 67,
    name: "Savlon Antiseptic Cream 100g",
    query: "savlon antiseptic cream",
  },
  { id: 68, name: "Johnson Baby Oil 500ml", query: "johnson baby oil" },
  { id: 69, name: "Himalaya Baby Powder 400g", query: "baby powder himalaya" },
  {
    id: 70,
    name: "Pampers Baby Diapers M 74pcs",
    query: "pampers diapers baby",
  },

  // HOME & KITCHEN (20 products) - Products 71-90
  {
    id: 71,
    name: "Prestige Deluxe Alpha Cooker 5L",
    query: "prestige pressure cooker",
  },
  {
    id: 72,
    name: "Hawkins Contura Hard Anodised 5L",
    query: "hawkins pressure cooker",
  },
  {
    id: 73,
    name: "Pigeon Favourite Non-Stick Cookware 3pc",
    query: "pigeon cookware nonstick",
  },
  {
    id: 74,
    name: "Prestige Omega Deluxe Granite Kadai",
    query: "kadai cookware pan",
  },
  {
    id: 75,
    name: "Milton Thermosteel Flask 1L",
    query: "milton flask thermos",
  },
  {
    id: 76,
    name: "Cello Opalware Dinner Set 27pcs",
    query: "dinner set plates dinnerware",
  },
  {
    id: 77,
    name: "Borosil Mixing Bowl Set 5pcs",
    query: "borosil mixing bowls glass",
  },
  {
    id: 78,
    name: "Tupperware Storage Container 4pcs",
    query: "tupperware container storage",
  },
  {
    id: 79,
    name: "Philips Daily Collection Kettle 1.5L",
    query: "philips electric kettle",
  },
  {
    id: 80,
    name: "Bajaj Majesty RX11 Toaster",
    query: "bajaj toaster appliance",
  },
  { id: 81, name: "Philips Air Fryer HD9252", query: "philips air fryer" },
  {
    id: 82,
    name: "Prestige IRIS 750W Mixer Grinder",
    query: "prestige mixer grinder",
  },
  {
    id: 83,
    name: "Bajaj Rex 500W Mixer Grinder",
    query: "bajaj mixer grinder",
  },
  { id: 84, name: "Philips Viva Collection Blender", query: "philips blender" },
  { id: 85, name: "Usha EI 3302 1000W Dry Iron", query: "usha iron appliance" },
  { id: 86, name: "Philips GC1905 Steam Iron", query: "philips steam iron" },
  {
    id: 87,
    name: "Eureka Forbes Vacuum Cleaner",
    query: "vacuum cleaner eureka forbes",
  },
  {
    id: 88,
    name: "Philips LED Bulb 9W Pack of 4",
    query: "led bulb light philips",
  },
  { id: 89, name: "Wipro LED Batten 20W", query: "led tube light wipro" },
  { id: 90, name: "Solimo Bedsheet Queen Size", query: "bedsheet bed linen" },

  // FASHION (10 products) - Products 91-100
  { id: 91, name: "Levi's Men's Slim Fit Jeans", query: "levis jeans denim" },
  {
    id: 92,
    name: "Allen Solly Men's Formal Shirt",
    query: "formal shirt mens",
  },
  { id: 93, name: "Peter England Blazer", query: "blazer formal suit" },
  { id: 94, name: "Nike Air Max Running Shoes", query: "nike air max shoes" },
  {
    id: 95,
    name: "Adidas Originals Superstar",
    query: "adidas superstar sneakers",
  },
  { id: 96, name: "Puma Unisex Backpack", query: "puma backpack bag" },
  { id: 97, name: "Fastrack Analog Watch", query: "fastrack watch analog" },
  { id: 98, name: "Titan Raga Watch", query: "titan watch women" },
  {
    id: 99,
    name: "Ray-Ban Aviator Sunglasses",
    query: "rayban aviator sunglasses",
  },
  {
    id: 100,
    name: "Wildcraft Travel Duffle 60L",
    query: "wildcraft duffle bag travel",
  },
];

async function fetchUnsplashImage(query, productId) {
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&per_page=1&orientation=squarish&client_id=${UNSPLASH_ACCESS_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular; // 1080px wide image
    } else {
      console.warn(`⚠️  No image found for product ${productId}: ${query}`);
      return null;
    }
  } catch (error) {
    console.error(
      `❌ Error fetching image for product ${productId}:`,
      error.message
    );
    return null;
  }
}

async function generateSQL() {
  console.log("🚀 Starting Unsplash image fetch for products 51-100...\n");

  if (UNSPLASH_ACCESS_KEY === "YOUR_SECOND_UNSPLASH_ACCESS_KEY_HERE") {
    console.error("❌ ERROR: Please set your Unsplash API key in the script!");
    console.log(
      "Get your free API key from: https://unsplash.com/developers\n"
    );
    return;
  }

  const imageUrls = [];

  // Fetch images with delay to respect rate limits
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`[${i + 1}/50] Fetching image for: ${product.name}`);

    const imageUrl = await fetchUnsplashImage(product.query, product.id);
    imageUrls.push({ id: product.id, name: product.name, url: imageUrl });

    // Rate limiting: wait 80ms between requests
    if (i < products.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
  }

  console.log("\n✅ Image fetch complete!\n");
  console.log("📝 Generating SQL statements...\n");

  // Generate SQL
  let sql = `-- Update product_images with Unsplash URLs (Products 51-100)
-- Generated on: ${new Date().toISOString()}
-- Total products: ${imageUrls.length}

DO $$
DECLARE
  prod_id uuid;
  img_count int;
BEGIN
`;

  imageUrls.forEach((item, index) => {
    if (item.url) {
      sql += `
  -- ${item.id}. ${item.name}
  SELECT id INTO prod_id FROM public.products WHERE sku = 'PERS-${String(
    item.id - 50
  ).padStart(3, "0")}' OR sku = 'HOME-${String(item.id - 70).padStart(
        3,
        "0"
      )}' OR sku = 'FASH-${String(item.id - 90).padStart(3, "0")}' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    SELECT COUNT(*) INTO img_count FROM public.product_images WHERE product_id = prod_id;
    IF img_count > 0 THEN
      UPDATE public.product_images SET image_url = '${
        item.url
      }' WHERE product_id = prod_id AND is_primary = true;
    ELSE
      INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES (prod_id, '${
        item.url
      }', true, 0);
    END IF;
  END IF;
`;
    }
  });

  sql += `
  RAISE NOTICE 'Successfully updated product images 51-100 with Unsplash URLs!';
END $$;
`;

  // Write to file
  const fs = require("fs");
  const outputFile = "05-update-product-images-51-100.sql";
  fs.writeFileSync(outputFile, sql, "utf8");

  console.log(`✅ SQL file generated: ${outputFile}`);
  console.log(`\n📊 Summary:`);
  console.log(`   - Total products: ${imageUrls.length}`);
  console.log(`   - Images found: ${imageUrls.filter((i) => i.url).length}`);
  console.log(`   - Images missing: ${imageUrls.filter((i) => !i.url).length}`);
  console.log(`\n🎯 Next steps:`);
  console.log(`   1. Review the generated SQL file`);
  console.log(`   2. Run it in your Supabase SQL Editor`);
  console.log(`   3. Verify images are displaying correctly\n`);
}

// Run the script
generateSQL().catch(console.error);
