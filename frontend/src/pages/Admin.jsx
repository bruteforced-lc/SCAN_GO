import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Scanner from '../components/Scanner.jsx';
import { formatDate, inr, getCategoryIcon } from '../utils.js';

const emptyForm = { name: '', barcode: '', price: '', stock: '', category: '' };

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [code, setCode] = useState('');
  const [verifyMsg, setVerifyMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('gate'); // 'gate' | 'products' | 'orders'
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const [p, o] = await Promise.all([api('/products'), api('/orders')]);
      setProducts(p.products);
      setOrders(o.orders);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveProduct = async (e) => {
    e.preventDefault();
    setMsg(null);
    const body = {
      name: form.name,
      barcode: form.barcode,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category || 'General',
    };
    try {
      if (editingId) {
        await api(`/products/${editingId}`, { method: 'PUT', body });
      } else {
        await api('/products', { method: 'POST', body });
      }
      setForm(emptyForm);
      setEditingId(null);
      setMsg({ type: 'ok', text: `Product ${editingId ? 'updated' : 'added'} successfully!` });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      barcode: p.barcode,
      price: String(p.price),
      stock: String(p.stock),
      category: p.category,
    });
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeProduct = async (p) => {
    if (!window.confirm(`Delete ${p.name} from store catalog?`)) return;
    try {
      await api(`/products/${p._id}`, { method: 'DELETE' });
      load();
      setMsg({ type: 'ok', text: `Deleted ${p.name}` });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const verify = async (value) => {
    const c = String(value).trim();
    if (!c) return;
    try {
      const { order } = await api('/orders/verify', { method: 'POST', body: { code: c } });
      setVerifyMsg({
        type: 'ok',
        text: `✓ GATE PASS APPROVED: ${order.exitCode} (${order.user?.name || 'Customer'}) • Total: ${inr(order.total)}`,
      });
      load();
    } catch (err) {
      setVerifyMsg({ type: 'error', text: err.message || 'Verification failed. Pass invalid or already used.' });
    }
  };

  // KPI Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const exitedOrders = orders.filter((o) => o.status === 'exited').length;
  const pendingExitOrders = orders.filter((o) => o.status === 'paid').length;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5 pb-24 md:pb-6">
      {/* Title & Store Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-white">Store Command Center</h1>
          <p className="text-xs text-slate-400">Exit gate verification, real-time inventory &amp; sales overview</p>
        </div>
        <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Terminal Online
        </span>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-3.5 space-y-1">
          <p className="text-[11px] text-slate-400 uppercase font-semibold">Total Revenue</p>
          <p className="font-display font-extrabold text-xl text-emerald-400">{inr(totalRevenue)}</p>
          <p className="text-[10px] text-slate-500">{orders.length} orders total</p>
        </div>

        <div className="card p-3.5 space-y-1">
          <p className="text-[11px] text-slate-400 uppercase font-semibold">Pending Exit</p>
          <p className="font-display font-extrabold text-xl text-amber-400">{pendingExitOrders}</p>
          <p className="text-[10px] text-slate-500">Shoppers at gate</p>
        </div>

        <div className="card p-3.5 space-y-1">
          <p className="text-[11px] text-slate-400 uppercase font-semibold">Exited Safely</p>
          <p className="font-display font-extrabold text-xl text-slate-200">{exitedOrders}</p>
          <p className="text-[10px] text-slate-500">Verified shoppers</p>
        </div>

        <div className="card p-3.5 space-y-1">
          <p className="text-[11px] text-slate-400 uppercase font-semibold">Catalog SKUs</p>
          <p className="font-display font-extrabold text-xl text-teal-400">{products.length}</p>
          <p className="text-[10px] text-slate-500">Active products</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('gate')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
            activeTab === 'gate'
              ? 'text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🚪 Exit Gate Scanner
          {activeTab === 'gate' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
            activeTab === 'products'
              ? 'text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📦 Inventory ({products.length})
          {activeTab === 'products' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
            activeTab === 'orders'
              ? 'text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📋 Orders Log ({orders.length})
          {activeTab === 'orders' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: Exit Gate Scanner */}
      {activeTab === 'gate' && (
        <section className="space-y-4">
          <div className="card space-y-4">
            <div>
              <h2 className="font-display font-bold text-base text-white">Exit Gate Verifier</h2>
              <p className="text-xs text-slate-400">
                Scan customer's digital exit QR pass to authenticate payment and open turnstile.
              </p>
            </div>

            <Scanner onScan={verify} />

            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                verify(code);
                setCode('');
              }}
            >
              <input
                className="input font-mono"
                placeholder="Or type manual Exit Code (e.g. SG-XXXXXXXX)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button className="btn btn-primary px-6 shrink-0" type="submit">
                Verify Pass
              </button>
            </form>

            {verifyMsg && (
              <div
                className={`p-4 rounded-xl text-xs font-semibold border ${
                  verifyMsg.type === 'ok'
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-950/30'
                    : 'bg-red-950/50 border-red-500/40 text-red-300 shadow-lg shadow-red-950/30'
                }`}
              >
                {verifyMsg.text}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 2: Products & Inventory */}
      {activeTab === 'products' && (
        <section className="space-y-4">
          {/* Add / Edit Form */}
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-sm text-white">
                {editingId ? 'Edit Product' : 'Add New Product to Store Catalog'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-white"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {msg && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                {msg.text}
              </div>
            )}

            <form onSubmit={saveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                className="input"
                placeholder="Product Name (e.g. Lay's India's Magic Masala)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="input font-mono"
                placeholder="Barcode (e.g. 8904063219718)"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                required
              />
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                placeholder="Price in ₹"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
              <input
                className="input"
                type="number"
                min="0"
                placeholder="Stock Quantity"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
              <input
                className="input sm:col-span-2"
                placeholder="Category (e.g. Snacks, Dairy, Grocery)"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />

              <div className="sm:col-span-2 flex gap-2 pt-1">
                <button className="btn btn-primary flex-1">
                  {editingId ? 'Update Product Details' : '+ Add Product to Catalog'}
                </button>
              </div>
            </form>
          </div>

          {/* Product Search & List */}
          <div className="card space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="font-display font-bold text-sm text-white">
                Catalog Items ({filteredProducts.length})
              </h2>
              <input
                className="input sm:w-64 text-xs py-1.5"
                placeholder="Search by name, barcode, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-800">
                    <th className="py-2">Item</th>
                    <th>Barcode</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span>{getCategoryIcon(p.category)}</span>
                          <div>
                            <span className="font-semibold text-slate-200 block">{p.name}</span>
                            <span className="text-[10px] text-slate-500">{p.category || 'General'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-slate-300">{p.barcode}</td>
                      <td className="font-bold text-emerald-400">{inr(p.price)}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.stock < 10
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="text-right space-x-2">
                        <button
                          className="text-emerald-400 hover:text-emerald-300 font-medium"
                          onClick={() => startEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-400 hover:text-red-300 font-medium"
                          onClick={() => removeProduct(p)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: Orders Ledger */}
      {activeTab === 'orders' && (
        <section className="card space-y-3">
          <h2 className="font-display font-bold text-sm text-white">Recent Store Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800">
                  <th className="py-2">Exit Code</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-mono text-emerald-400 font-semibold">{o.exitCode}</td>
                    <td className="text-slate-200">{o.user?.name || 'Walk-in Shopper'}</td>
                    <td className="font-bold text-slate-100">{inr(o.total)}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        o.status === 'exited'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {o.status === 'exited' ? 'Exited ✓' : 'Paid • Pending Exit'}
                      </span>
                    </td>
                    <td className="text-slate-400">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
