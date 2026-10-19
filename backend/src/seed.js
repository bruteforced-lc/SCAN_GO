import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js';

// Build a valid EAN-13 barcode from 12 digits (adds the check digit)
const ean13 = (base12) => {
  const sum = base12
    .split('')
    .reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
  return base12 + ((10 - (sum % 10)) % 10);
};

const sample = [
  // Original 10
  ['Milk 500ml', 28, 'Dairy'],
  ['Brown Bread', 45, 'Bakery'],
  ['Basmati Rice 1kg', 120, 'Grocery'],
  ['Potato Chips', 20, 'Snacks'],
  ['Orange Juice 1L', 95, 'Beverages'],
  ['Notebook A4', 60, 'Stationery'],
  ['Toothpaste 100g', 75, 'Personal Care'],
  ['Dark Chocolate', 110, 'Snacks'],
  ['Green Tea 25 bags', 150, 'Beverages'],
  ['Hand Wash 250ml', 99, 'Personal Care'],
  // New 20
  ['Paneer 200g', 85, 'Dairy'],
  ['Butter 100g', 55, 'Dairy'],
  ['Whole Wheat Atta 5kg', 280, 'Grocery'],
  ['Toor Dal 1kg', 160, 'Grocery'],
  ['Sunflower Oil 1L', 175, 'Grocery'],
  ['Maggi Noodles 70g', 14, 'Snacks'],
  ['Biscuits Parle-G 200g', 20, 'Snacks'],
  ['Cornflakes 500g', 190, 'Breakfast'],
  ['Mango Drink 200ml', 20, 'Beverages'],
  ['Coconut Water 300ml', 35, 'Beverages'],
  ['Shampoo 200ml', 165, 'Personal Care'],
  ['Body Lotion 300ml', 220, 'Personal Care'],
  ['Dettol Soap 75g', 45, 'Personal Care'],
  ['Dishwash Bar 500g', 60, 'Cleaning'],
  ['Floor Cleaner 1L', 130, 'Cleaning'],
  ['Frozen Peas 500g', 75, 'Frozen'],
  ['Ice Cream Vanilla 500ml', 140, 'Frozen'],
  ['Vitamin C Tablets 10s', 55, 'Health'],
  ['Band-Aid Box 10s', 40, 'Health'],
  ['Pen Blue Ink 5pcs', 35, 'Stationery'],
].map(([name, price, category], i) => ({
  name,
  price,
  category,
  stock: 50,
  barcode: ean13(String(890100000000 + i + 1)),
}));

// Products with real barcodes (scanned from actual packets)
const realBarcodeProducts = [
  { name: 'Haldiram Chips', price: 30, category: 'Snacks', stock: 50, barcode: '8904063219718' },
];

export async function seedDatabase() {
  for (const p of sample) {
    await Product.updateOne({ barcode: p.barcode }, { $set: p }, { upsert: true });
  }
  for (const p of realBarcodeProducts) {
    await Product.updateOne({ barcode: p.barcode }, { $set: p }, { upsert: true });
  }
  const allProducts = [...sample, ...realBarcodeProducts];

  const adminEmail = 'admin@scango.com';
  let adminStatus = 'already exists';
  const adminPassword = process.env.ADMIN_PASSWORD || '124Dhruv@';
  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({
      name: 'Store Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    adminStatus = 'created';
  }

  return {
    success: true,
    productsSeeded: allProducts.length,
    adminEmail,
    adminStatus,
  };
}

// When run directly from terminal:
if (process.argv[1]?.endsWith('seed.js')) {
  await connectDB();
  const res = await seedDatabase();
  console.log(`Seeded ${res.productsSeeded} products, Admin ${res.adminStatus}`);
  await mongoose.disconnect();
}
