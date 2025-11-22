/**
 * Unsplash Image Fetcher for 100 Products
 *
 * This script:
 * 1. Queries Unsplash API for relevant images based on product names/categories
 * 2. Fetches one image URL per product
 * 3. Generates SQL INSERT statements for product_images table
 *
 * Setup:
 * 1. Get a free Unsplash API key from https://unsplash.com/developers
 * 2. Run: npm install node-fetch
 * 3. Set your API key below
 * 4. Run: node fetch-unsplash-images.js
 */

const UNSPLASH_ACCESS_KEY = "JMMHOyrPEugz90PSjGqcmKwqvplaE8O8K_f2MbBZsqk"; // Get from https://unsplash.com/developers

const products = [
  // ELECTRONICS (25 products)
  {
    id: 1,
    name: "Samsung Galaxy S24 Ultra",
    query: "samsung smartphone galaxy",
  },
  { id: 2, name: "Apple iPhone 15 Pro Max", query: "iphone apple smartphone" },
  { id: 3, name: "OnePlus 12", query: "oneplus android smartphone" },
  { id: 4, name: "Google Pixel 8 Pro", query: "google pixel smartphone" },
  { id: 5, name: "Xiaomi 14 Pro", query: "xiaomi smartphone mobile" },
  { id: 6, name: 'MacBook Pro 14" M3', query: "macbook apple laptop" },
  { id: 7, name: "Dell XPS 15", query: "dell laptop computer" },
  { id: 8, name: "ASUS ROG Strix G16", query: "asus gaming laptop" },
  { id: 9, name: "HP Pavilion Plus 14", query: "hp laptop computer" },
  {
    id: 10,
    name: "Lenovo ThinkPad X1 Carbon",
    query: "lenovo thinkpad laptop",
  },
  { id: 11, name: 'iPad Pro 12.9" M2', query: "ipad apple tablet" },
  { id: 12, name: "Samsung Galaxy Tab S9", query: "samsung tablet galaxy tab" },
  { id: 13, name: "Sony WH-1000XM5", query: "sony headphones wireless" },
  { id: 14, name: "AirPods Pro 2nd Gen", query: "airpods apple earbuds" },
  { id: 15, name: "Bose QuietComfort 45", query: "bose headphones" },
  { id: 16, name: "Apple Watch Series 9", query: "apple watch smartwatch" },
  { id: 17, name: "Samsung Galaxy Watch 6", query: "samsung smartwatch" },
  { id: 18, name: "Canon EOS R6 Mark II", query: "canon camera professional" },
  { id: 19, name: "Sony A7 IV", query: "sony camera mirrorless" },
  { id: 20, name: "GoPro Hero 12 Black", query: "gopro action camera" },
  { id: 21, name: 'LG 55" C3 OLED TV', query: "lg oled television" },
  { id: 22, name: 'Samsung 65" Neo QLED', query: "samsung qled tv" },
  { id: 23, name: "Sony PS5 Slim", query: "playstation ps5 console" },
  { id: 24, name: "Xbox Series X", query: "xbox console gaming" },
  { id: 25, name: "Nintendo Switch OLED", query: "nintendo switch console" },

  // GROCERY (25 products)
  { id: 26, name: "Aashirvaad Atta 10kg", query: "wheat flour atta" },
  { id: 27, name: "Fortune Sunlite Oil 5L", query: "cooking oil sunflower" },
  { id: 28, name: "Tata Salt Iodized 1kg", query: "salt iodized" },
  { id: 29, name: "India Gate Basmati Rice 5kg", query: "basmati rice" },
  {
    id: 30,
    name: "Maggi 2-Minute Noodles 12-Pack",
    query: "maggi noodles instant",
  },
  { id: 31, name: "Amul Gold Milk 1L", query: "milk dairy amul" },
  {
    id: 32,
    name: "Britannia Good Day Butter 600g",
    query: "cookies biscuits butter",
  },
  { id: 33, name: "Parle-G Biscuits 1kg", query: "parle biscuits glucose" },
  {
    id: 34,
    name: "Cadbury Dairy Milk 120g",
    query: "cadbury chocolate dairy milk",
  },
  {
    id: 35,
    name: "Nescafe Classic Coffee 200g",
    query: "nescafe coffee instant",
  },
  { id: 36, name: "Taj Mahal Tea 1kg", query: "tea black taj mahal" },
  { id: 37, name: "Red Label Natural Care Tea 1kg", query: "red label tea" },
  {
    id: 38,
    name: "Kissan Fresh Tomato Ketchup 1kg",
    query: "ketchup tomato kissan",
  },
  { id: 39, name: "Everest Garam Masala 100g", query: "garam masala spices" },
  { id: 40, name: "MDH Chana Masala 100g", query: "chana masala spices mdh" },
  {
    id: 41,
    name: "Catch Sprinklers Chat Masala 100g",
    query: "chat masala spices",
  },
  { id: 42, name: "Haldiram Aloo Bhujia 1kg", query: "haldiram bhujia snack" },
  { id: 43, name: "Kurkure Masala Munch 90g", query: "kurkure snacks chips" },
  { id: 44, name: "Lays Classic Salted 90g", query: "lays chips potato" },
  { id: 45, name: "Bingo Mad Angles 90g", query: "bingo chips snacks" },
  { id: 46, name: "Amul Butter 500g", query: "amul butter dairy" },
  { id: 47, name: "Mother Dairy Paneer 200g", query: "paneer cottage cheese" },
  { id: 48, name: "Amul Cheese Slices 400g", query: "cheese slices amul" },
  {
    id: 49,
    name: "Surf Excel Matic Liquid 2L",
    query: "detergent liquid surf excel",
  },
  { id: 50, name: "Vim Dishwash Liquid 2L", query: "dishwash liquid vim" },

  // PERSONAL CARE (20 products)
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

  // HOME & KITCHEN (20 products)
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

  // FASHION (10 products)
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
  console.log("🚀 Starting Unsplash image fetch for 100 products...\n");

  if (UNSPLASH_ACCESS_KEY === "YOUR_UNSPLASH_ACCESS_KEY_HERE") {
    console.error("❌ ERROR: Please set your Unsplash API key in the script!");
    console.log(
      "Get your free API key from: https://unsplash.com/developers\n"
    );
    return;
  }

  const imageUrls = [];

  // Fetch images with delay to respect rate limits (50 requests per hour for free tier)
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`[${i + 1}/100] Fetching image for: ${product.name}`);

    const imageUrl = await fetchUnsplashImage(product.query, product.id);
    imageUrls.push({ id: product.id, name: product.name, url: imageUrl });

    // Rate limiting: wait 80ms between requests (max 45 requests per hour to be safe)
    if (i < products.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
  }

  console.log("\n✅ Image fetch complete!\n");
  console.log("📝 Generating SQL statements...\n");

  // Generate SQL
  let sql = `-- Update product_images with Unsplash URLs
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
  -- ${index + 1}. ${item.name}
  SELECT id INTO prod_id FROM public.products WHERE sku = 'ELEC-${String(
    item.id
  ).padStart(3, "0")}' OR sku = 'GROC-${String(item.id - 25).padStart(
        3,
        "0"
      )}' OR sku = 'PERS-${String(item.id - 50).padStart(
        3,
        "0"
      )}' OR sku = 'HOME-${String(item.id - 70).padStart(
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
  RAISE NOTICE 'Successfully updated product images with Unsplash URLs!';
END $$;
`;

  // Write to file
  const fs = require("fs");
  const outputFile = "04-update-product-images.sql";
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
