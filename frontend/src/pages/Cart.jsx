import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { inr, getCategoryIcon } from '../utils.js';

export default function Cart() {
  const { items, setQty, remove, total, clear } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="card text-center py-12 px-6 space-y-4 max-w-md mx-auto my-8">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-4xl">
          🛒
        </div>
        <div className="space-y-1">
          <h2 className="font-display font-bold text-xl text-white">Your Cart is Empty</h2>
          <p className="text-xs text-slate-400">
            Scan any barcode in the store to add items to your basket instantly.
          </p>
        </div>
        <Link to="/" className="btn btn-primary inline-flex items-center gap-2 px-6">
          <svg className="w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Start Scanning
        </Link>
      </div>
    );
  }

  const itemCount = items.reduce((acc, i) => acc + i.qty, 0);

  return (
    <div className="space-y-4 pb-28 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-white">Shopping Cart</h1>
          <p className="text-xs text-slate-400">{itemCount} items in basket</p>
        </div>
        <button
          onClick={clear}
          className="text-xs text-slate-400 hover:text-red-400 transition-colors font-medium flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear Cart
        </button>
      </div>

      {/* Cart Items List */}
      <div className="space-y-2.5">
        {items.map((i) => (
          <div
            key={i.barcode}
            className="card p-3.5 flex items-center gap-3.5 hover:border-slate-700/80 transition-all"
          >
            {/* Category Icon */}
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-2xl shrink-0">
              {getCategoryIcon(i.category)}
            </div>

            {/* Title & Info */}
            <div className="mr-auto min-w-0">
              <p className="font-semibold text-slate-100 text-sm truncate">{i.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-emerald-400 font-medium">{inr(i.price)}</span>
                <span className="text-[10px] text-slate-500 font-mono">#{i.barcode.slice(-6)}</span>
              </div>
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-0.5 shrink-0">
              <button
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-90 transition-all font-bold text-sm"
                onClick={() => setQty(i.barcode, i.qty - 1)}
              >
                -
              </button>
              <span className="w-7 text-center font-bold text-xs text-slate-100 font-mono">
                {i.qty}
              </span>
              <button
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-90 transition-all font-bold text-sm disabled:opacity-30 disabled:pointer-events-none"
                disabled={i.qty >= i.stock}
                onClick={() => setQty(i.barcode, i.qty + 1)}
              >
                +
              </button>
            </div>

            {/* Item Total */}
            <div className="text-right w-16 shrink-0">
              <p className="font-bold text-slate-100 text-sm">{inr(i.price * i.qty)}</p>
            </div>

            {/* Remove */}
            <button
              className="text-slate-500 hover:text-red-400 p-1.5 transition-colors shrink-0"
              title="Remove item"
              onClick={() => remove(i.barcode)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Bill Summary Breakdown */}
      <div className="card space-y-3">
        <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400">Order Summary</h2>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal ({itemCount} items)</span>
            <span className="font-medium text-slate-100">{inr(total)}</span>
          </div>
          <div className="flex justify-between text-emerald-400 font-medium">
            <span>Express Store Discount</span>
            <span>Free Self-Checkout</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Estimated Taxes (GST)</span>
            <span>Included in price</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Total Payable</span>
            <span className="font-display font-extrabold text-xl text-emerald-400">{inr(total)}</span>
          </div>

          <button
            className="btn btn-primary px-6 py-3 text-sm font-bold flex items-center gap-2"
            onClick={() => navigate('/checkout')}
          >
            <span>Proceed to Pay</span>
            <svg className="w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
