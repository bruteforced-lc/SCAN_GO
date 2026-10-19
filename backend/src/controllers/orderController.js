import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const makeExitCode = () => 'SG-' + crypto.randomBytes(4).toString('hex').toUpperCase();

// POST /api/orders/checkout
// body: { items: [{ barcode, qty }], paymentMethod: 'mock' }
// Prices are always read from the database, never trusted from the client.
export const checkout = asyncHandler(async (req, res) => {
  const { items, paymentMethod = 'mock' } = req.body;

  // To add real payments later (e.g. Razorpay), verify the payment here
  // before reserving stock and creating the order.
  if (paymentMethod !== 'mock') throw httpError(400, 'Unsupported payment method');
  if (!Array.isArray(items) || items.length === 0) throw httpError(400, 'Cart is empty');

  // merge duplicate barcodes and validate quantities
  const wanted = new Map();
  for (const it of items) {
    const qty = Number(it.qty);
    if (!it.barcode || !Number.isInteger(qty) || qty < 1) {
      throw httpError(400, 'Invalid cart item');
    }
    wanted.set(it.barcode, (wanted.get(it.barcode) || 0) + qty);
  }

  const products = await Product.find({ barcode: { $in: [...wanted.keys()] } });
  if (products.length !== wanted.size) {
    throw httpError(404, 'One or more products no longer exist');
  }

  // Reserve stock with atomic updates. If anything fails, put the stock back.
  const reserved = [];
  try {
    for (const p of products) {
      const qty = wanted.get(p.barcode);
      const updated = await Product.findOneAndUpdate(
        { _id: p._id, stock: { $gte: qty } },
        { $inc: { stock: -qty } }
      );
      if (!updated) throw httpError(409, `Not enough stock for ${p.name}`);
      reserved.push({ id: p._id, qty });
    }

    const orderItems = products.map((p) => ({
      product: p._id,
      name: p.name,
      barcode: p.barcode,
      price: p.price,
      qty: wanted.get(p.barcode),
    }));
    const total = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      total: Math.round(total * 100) / 100,
      paymentMethod,
      paymentStatus: 'paid',
      exitCode: makeExitCode(),
    });

    res.status(201).json({ order });
  } catch (err) {
    await Promise.all(
      reserved.map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty } }))
    );
    throw err;
  }
});

// GET /api/orders/mine
export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

// GET /api/orders (admin) - latest 100 orders
export const allOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('user', 'name email');
  res.json({ orders });
});

// GET /api/orders/:id (owner or admin)
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw httpError(404, 'Order not found');

  const isOwner = String(order.user) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw httpError(403, 'Not allowed');

  res.json({ order });
});

// POST /api/orders/verify (admin) - exit gate check
// body: { code: 'SG-XXXXXXXX' }
export const verifyExit = asyncHandler(async (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  if (!code) throw httpError(400, 'Exit code is required');

  const order = await Order.findOne({ exitCode: code }).populate('user', 'name email');
  if (!order) throw httpError(404, 'Invalid exit code');
  if (order.paymentStatus !== 'paid') throw httpError(402, 'Order is not paid');
  if (order.status === 'exited') {
    throw httpError(409, `Code already used at ${order.exitedAt?.toLocaleString() || 'earlier'}`);
  }

  order.status = 'exited';
  order.exitedAt = new Date();
  await order.save();

  res.json({ message: 'Exit verified', order });
});
