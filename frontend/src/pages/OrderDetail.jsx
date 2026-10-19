import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../api.js';
import { formatDate, inr, getCategoryIcon } from '../utils.js';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api(`/orders/${id}`)
      .then((d) => setOrder(d.order))
      .catch((e) => setError(e.message));
  }, [id]);

  const copyCode = () => {
    if (!order?.exitCode) return;
    navigator.clipboard?.writeText(order.exitCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="card text-center py-8 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="card text-center py-16 text-slate-400 space-y-3">
        <div className="w-8 h-8 mx-auto border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs">Fetching your digital exit pass...</p>
      </div>
    );
  }

  const exited = order.status === 'exited';

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20 md:pb-6">
      {/* Smart Digital Ticket Card */}
      <div className="card border-slate-700/80 p-0 overflow-hidden shadow-2xl relative">
        {/* Top Ticket Header Banner */}
        <div
          className={`p-5 text-center ${
            exited
              ? 'bg-slate-800/80 border-b border-slate-700'
              : 'bg-gradient-to-b from-emerald-950/60 to-slate-900 border-b border-emerald-500/30'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 backdrop-blur-md border border-white/10">
            {exited ? (
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Store Exit Verified
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Active • Ready for Exit Gate
              </span>
            )}
          </div>

          <h1 className="font-display font-extrabold text-2xl text-white">
            {exited ? 'Trip Completed' : 'Digital Exit Pass'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {exited
              ? `Gate verified on ${formatDate(order.exitedAt)}`
              : 'Present this QR pass to the optical scanner at the exit turnstile.'}
          </p>
        </div>

        {/* QR Code Presentation Box */}
        <div className="p-6 bg-slate-900/60 flex flex-col items-center justify-center">
          <div className="p-4 bg-white rounded-3xl shadow-2xl shadow-emerald-500/10 border-4 border-slate-800">
            <QRCodeSVG
              value={order.exitCode}
              size={190}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Monospace Code Pill */}
          <div className="mt-4 flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <span className="font-mono text-emerald-400 font-bold text-sm tracking-wider">
              {order.exitCode}
            </span>
            <button
              onClick={copyCode}
              className="text-slate-400 hover:text-white text-xs pl-2 border-l border-slate-800"
              title="Copy Exit Code"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Perforated Edge Visual Divider */}
        <div className="relative flex items-center justify-between px-2 -my-2.5 z-10">
          <div className="w-5 h-5 rounded-full bg-slate-950 -ml-2.5 border-r border-slate-700/80" />
          <div className="flex-1 border-t-2 border-dashed border-slate-800 mx-2" />
          <div className="w-5 h-5 rounded-full bg-slate-950 -mr-2.5 border-l border-slate-700/80" />
        </div>

        {/* Receipt Details Section */}
        <div className="p-5 bg-slate-900/40 space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Transaction ID: #{order._id.slice(-8)}</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>

          <div className="divide-y divide-slate-800/80 text-xs">
            {order.items.map((i) => (
              <div key={i.barcode} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{getCategoryIcon(i.category)}</span>
                  <span className="text-slate-200">{i.name} × {i.qty}</span>
                </div>
                <span className="font-semibold text-slate-200">{inr(i.price * i.qty)}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs uppercase font-bold text-slate-400">Paid Amount</span>
            <span className="font-display font-extrabold text-lg text-emerald-400">
              {inr(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-2">
        <Link to="/orders" className="btn btn-secondary flex-1 text-xs">
          ← View All Orders
        </Link>
        <Link to="/" className="btn btn-primary flex-1 text-xs">
          New Shopping Trip
        </Link>
      </div>
    </div>
  );
}
