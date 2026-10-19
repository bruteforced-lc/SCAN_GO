import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    barcode: String,
    price: Number, // price at the time of purchase
    qty: { type: Number, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: 'mock' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    // paid -> customer has paid, exited -> verified at the exit gate
    status: { type: String, enum: ['paid', 'exited'], default: 'paid' },
    exitCode: { type: String, required: true, unique: true },
    exitedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
