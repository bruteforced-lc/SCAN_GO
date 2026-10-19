import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { inr, getCategoryIcon } from '../utils.js';

export default function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [payMethod, setPayMethod] = useState('upi');

  if (items.length === 0) {
    return (
      <div className="card text-center py-12 px-6 max-w-md mx-auto my-8 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-800 flex items-center justify-center text-3xl">
          🧾
        </div>
        <h2 className="font-display font-bold text-lg text-white">No items to checkout</h2>
        <p className="text-xs text-slate-400">Your basket is empty. Add items from the store first.</p>
        <Link to="/" className="btn btn-primary inline-flex">
          Scan Products
        </Link>
      </div>
    );
  }

  const pay = async () => {
    setError('');
    setBusy(true);
    try {
      const { order } = await api('/orders/checkout', {
        method: 'POST',
        body: {
          items: items.map((i) => ({ barcode: i.barcode, qty: i.qty })),
          paymentMethod: payMethod,
        },
      });
      clear();
      navigate(`/orders/${order._id}`);
    } catch (err) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-20 md:pb-6">
      {/* Title */}
      <div>
        <h1 className="font-display font-bold text-xl text-white">Express Checkout</h1>
        <p className="text-xs text-slate-400">Complete payment to receive your digital exit pass</p>
      </div>

      {/* Cart Items Recap Card */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Items in Basket ({items.length})
          </span>
          <Link to="/cart" className="text-xs text-emerald-400 hover:underline">
            Edit Basket
          </Link>
        </div>

        <div className="divide-y divide-slate-800/80 max-h-48 overflow-y-auto pr-1">
          {items.map((i) => (
            <div key={i.barcode} className="flex items-center justify-between py-2 text-xs">
              <div className="flex items-center gap-2">
                <span>{getCategoryIcon(i.category)}</span>
                <div>
                  <p className="font-medium text-slate-200">{i.name}</p>
                  <span className="text-[10px] text-slate-500">Qty: {i.qty} × {inr(i.price)}</span>
                </div>
              </div>
              <span className="font-semibold text-slate-200">{inr(i.price * i.qty)}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
          <span className="text-sm font-medium text-slate-300">Grand Total</span>
          <span className="font-display font-extrabold text-xl text-emerald-400">{inr(total)}</span>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="card space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Select Payment Method
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* UPI Option */}
          <button
            type="button"
            onClick={() => setPayMethod('upi')}
            className={`p-3 rounded-xl border text-left transition-all ${
              payMethod === 'upi'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-sm shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <div className="text-xl mb-1">📱</div>
            <p className="text-xs font-bold text-slate-200">UPI / QR</p>
            <p className="text-[10px] text-slate-400">GPay, PhonePe, Paytm</p>
          </button>

          {/* Card Option */}
          <button
            type="button"
            onClick={() => setPayMethod('card')}
            className={`p-3 rounded-xl border text-left transition-all ${
              payMethod === 'card'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-sm shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <div className="text-xl mb-1">💳</div>
            <p className="text-xs font-bold text-slate-200">Debit / Credit</p>
            <p className="text-[10px] text-slate-400">Visa, Mastercard, RuPay</p>
          </button>

          {/* Quick Mock Pay */}
          <button
            type="button"
            onClick={() => setPayMethod('mock')}
            className={`p-3 rounded-xl border text-left transition-all ${
              payMethod === 'mock'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-sm shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <div className="text-xl mb-1">⚡</div>
            <p className="text-xs font-bold text-slate-200">1-Tap Fast Pay</p>
            <p className="text-[10px] text-slate-400">Sandbox Test Pay</p>
          </button>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
          <span className="text-emerald-400 text-sm">🔒</span>
          <span>Simulation Mode: No real financial transaction will occur. Instant exit pass issued.</span>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Pay CTA Button */}
      <button
        className="btn btn-primary w-full py-3.5 text-base font-bold flex items-center justify-center gap-2"
        onClick={pay}
        disabled={busy}
      >
        {busy ? (
          <>
            <svg className="animate-spin w-4 h-4 text-slate-950" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Authorizing Payment...
          </>
        ) : (
          <>
            <span>Authorize &amp; Pay {inr(total)}</span>
            <svg className="w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}
