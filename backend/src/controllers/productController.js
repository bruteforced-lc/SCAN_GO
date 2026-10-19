import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/products?search=milk
export const listProducts = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = search
    ? {
        $or: [
          { name: new RegExp(escapeRegex(String(search)), 'i') },
          { barcode: String(search) },
        ],
      }
    : {};
  const products = await Product.find(filter).sort({ name: 1 });
  res.json({ products });
});

// GET /api/products/barcode/:barcode
export const getByBarcode = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ barcode: req.params.barcode.trim() });
  if (!product) throw httpError(404, 'No product found for this barcode');
  res.json({ product });
});

// POST /api/products (admin)
export const createProduct = asyncHandler(async (req, res) => {
  const { name, barcode, price, stock, category } = req.body;
  const product = await Product.create({ name, barcode, price, stock, category });
  res.status(201).json({ product });
});

// PUT /api/products/:id (admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const allowed = ['name', 'barcode', 'price', 'stock', 'category'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!product) throw httpError(404, 'Product not found');
  res.json({ product });
});

// DELETE /api/products/:id (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw httpError(404, 'Product not found');
  res.json({ message: 'Product deleted' });
});
