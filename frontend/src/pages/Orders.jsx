import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { formatDate, inr } from '../utils.js';

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/orders/mine')
      .then((d) => setOrders(d.orders))
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="card text-center py-6 text-red-400 text-sm">{error}</div>;
  }

  if (!orders) {
    return (
      <div className="card text-center py-16 text-slate-400 space-y-3">
        <div className="w-8 h-8 mx-auto border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs">Loading order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-white">Order History</h1>
          <p className="text-xs text-slate-400">Past shopping trips &amp; digital exit gate passes</p>
        </div>
        <Link to="/" className="btn btn-secondary text-xs">
          + New Scan
        </Link>
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="card text-center py-12 px-6 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-800 flex items-center justify-center text-3xl">
            📦
          </div>
          <h2 className="font-semibold text-slate-200 text-sm">No shopping trips yet</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Scan items in the supermarket and checkout to get your first exit pass.
          </p>
          <Link to="/" className="btn btn-primary inline-flex mt-2 text-xs">
            Start First Trip
          </Link>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-3">
        {orders.map((o) => {
          const isExited = o.status === 'exited';
          return (
            <Link
              key={o._id}
              to={`/orders/${o._id}`}
              className="card p-4 block hover:border-slate-700/80 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-100">
                      {o.exitCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isExited
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isExited ? 'Exited ✓' : 'Ready to Exit ⚡'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(o.createdAt)} • {o.items.length} item{o.items.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="font-display font-bold text-base text-emerald-400">{inr(o.total)}</p>
                    <span className="text-[10px] text-slate-500">Tap for QR →</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
