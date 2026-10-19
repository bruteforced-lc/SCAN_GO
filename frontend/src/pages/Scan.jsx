import { useState } from 'react';
import { Link } from 'react-router-dom';
import Scanner from '../components/Scanner.jsx';
import { api } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { inr, getCategoryIcon } from '../utils.js';

export default function Scan() {
  const { add, count, total } = useCart();
  const [manual, setManual] = useState('');
  const [msg, setMsg] = useState(null); // { type: 'ok' | 'error', text }
  const [lastItem, setLastItem] = useState(null);

  const handleCode = async (code) => {
    const clean = String(code).trim();
    if (!clean) return;
    try {
      const { product } = await api(`/products/barcode/${encodeURIComponent(clean)}`);
      if (product.stock <= 0) {
        setMsg({ type: 'error', text: `${product.name} is out of stock!` });
        return;
      }
      add(product);
      setLastItem(product);
      setMsg({ type: 'ok', text: `Added ${product.name} to cart!` });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Product not recognized in store catalog' });
    }
  };

  const submitManual = (e) => {
    e.preventDefault();
    handleCode(manual);
    setManual('');
  };

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      {/* Top Welcome Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-white">Smart Scanner</h1>
          <p className="text-xs text-slate-400">Scan barcodes directly from products to add to your cart</p>
        </div>
        {count > 0 && (
          <Link
            to="/cart"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
          >
            <span>{count} in cart</span>
            <span className="font-bold text-white">{inr(total)}</span>
          </Link>
        )}
      </div>

      {/* Main Scanner Card */}
      <div className="card space-y-3">
        <Scanner onScan={handleCode} />
      </div>

      {/* Last Added Item Showcase Card */}
      {lastItem && (
        <div className="card border-emerald-500/30 bg-emerald-950/20 flex items-center gap-3.5 p-3.5 animate-fadeIn">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl shrink-0">
            {getCategoryIcon(lastItem.category)}
          </div>
          <div className="mr-auto min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {lastItem.category || 'Grocery'}
            </span>
            <p className="font-semibold text-slate-100 text-sm truncate mt-0.5">{lastItem.name}</p>
            <p className="text-xs text-slate-400 font-mono">{lastItem.barcode}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-emerald-400 text-base">{inr(lastItem.price)}</p>
            <span className="text-[10px] text-slate-400">Added to Cart ✓</span>
          </div>
        </div>
      )}

      {/* Manual Barcode Input Card */}
      <div className="card">
        <form onSubmit={submitManual} className="space-y-2">
          <label className="text-xs font-medium text-slate-400 block">
            Can't scan? Type barcode manually:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                className="input font-mono pl-9"
                placeholder="e.g. 8904063219718"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
              />
              <span className="absolute left-3 top-3 text-slate-500 text-xs">#</span>
            </div>
            <button className="btn btn-secondary px-5 font-semibold text-xs" type="submit">
              Lookup
            </button>
          </div>
        </form>
      </div>

      {/* Notification Toast Message */}
      {msg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between border transition-all ${
            msg.type === 'ok'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 shadow-lg shadow-emerald-950/20'
              : 'bg-red-950/40 text-red-300 border-red-500/30 shadow-lg shadow-red-950/20'
          }`}
        >
          <div className="flex items-center gap-2">
            {msg.type === 'ok' ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-red-400" />
            )}
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg(null)} className="text-slate-400 hover:text-white text-sm px-1">
            ✕
          </button>
        </div>
      )}

      {/* Floating Bottom Bar for Quick Checkout */}
      {count > 0 && (
        <div className="fixed bottom-16 md:bottom-6 left-0 right-0 px-4 z-30 max-w-lg mx-auto">
          <Link
            to="/cart"
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-2xl shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-slate-950/20 flex items-center justify-center text-xs text-slate-950">
                {count}
              </span>
              <span className="text-sm tracking-tight font-extrabold">View My Cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold">{inr(total)}</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
