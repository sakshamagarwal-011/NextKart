import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Package, Search, ToggleLeft, ToggleRight, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatPrice } from '../../lib/utils';
import { CATEGORIES, UNITS } from '../../lib/constants';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const emptyProduct = { name: '', description: '', price: '', category_id: '', unit: 'piece', in_stock: true, image_url: '' };

export default function ProductsPage() {
  const { shop } = useAuth();
  const { isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const c = (light, dark) => isDark ? dark : light;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (shop) fetchProducts(); }, [shop]);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').eq('shop_id', shop.id).order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  function openAdd() { setForm({ ...emptyProduct }); setEditingProduct(null); setModal(true); }
  function openEdit(product) { setForm({ ...product }); setEditingProduct(product); setModal(true); }

  async function handleSave() {
    if (!form.name || !form.price) return toast.error('Name and price required');
    setSaving(true);
    try {
      if (editingProduct) {
        const { error } = await supabase.from('products').update({
          name: form.name, description: form.description, price: Number(form.price),
          category_id: form.category_id || null, unit: form.unit, in_stock: form.in_stock, image_url: form.image_url,
        }).eq('id', editingProduct.id);
        if (error) throw error;
        toast.success('Product updated! ✅');
      } else {
        const { error } = await supabase.from('products').insert({
          shop_id: shop.id, name: form.name, description: form.description, price: Number(form.price),
          category_id: form.category_id || null, unit: form.unit, in_stock: form.in_stock, image_url: form.image_url,
        });
        if (error) throw error;
        toast.success('Product added! 🎉');
      }
      setModal(false);
      fetchProducts();
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    toast.success('Product deleted');
    fetchProducts();
  }

  async function toggleStock(product) {
    await supabase.from('products').update({ in_stock: !product.in_stock }).eq('id', product.id);
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, in_stock: !p.in_stock } : p));
    toast.success(product.in_stock ? 'Marked out of stock' : 'Marked in stock');
  }

  async function uploadProductImage(file) {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `products/${shop.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('shop-assets').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('shop-assets').getPublicUrl(path);
      setForm(prev => ({ ...prev, image_url: data.publicUrl }));
      toast.success('Image uploaded!');
    } catch (err) { toast.error(err.message); } finally { setUploading(false); }
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.1)')}`, background: c('white', 'rgba(255,255,255,0.05)'), color: c('#0F172A', 'white'), fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: c('#334155', '#CBD5E1'), marginBottom: '6px' };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: c('#0F172A', 'white'), margin: '0 0 4px' }}>Products 📦</h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>{products.length} products</p>
        </div>
        <button onClick={openAdd} style={{ padding: '10px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #6C63FF, #5B52E5)', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(108,99,255,0.3)' }}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
        <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '14px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, background: c('white', 'rgba(255,255,255,0.03)'), color: c('#0F172A', 'white'), fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: c('white', 'rgba(255,255,255,0.03)'), borderRadius: '20px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}` }}>
          <Package size={48} color="#6C63FF" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: c('#1E293B', 'white'), margin: '0 0 8px' }}>No products</h3>
          <p style={{ color: '#64748B', fontSize: '14px', margin: '0 0 20px' }}>Add your first product to start selling!</p>
          <button onClick={openAdd} style={{ padding: '10px 20px', borderRadius: '12px', background: '#6C63FF', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
            + Add Product
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {filtered.map((product) => (
            <div key={product.id} style={{ borderRadius: '16px', overflow: 'hidden', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, background: c('white', 'rgba(255,255,255,0.03)') }}>
              <div style={{ height: '160px', position: 'relative', background: c('#F1F5F9', '#1E293B') }}>
                {product.image_url ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>📦</div>}
                {!product.in_stock && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'white', fontWeight: 800, fontSize: '14px' }}>Out of Stock</span></div>}
              </div>
              
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: c('#0F172A', 'white'), margin: '0 0 8px' }}>{product.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontWeight: 800, color: '#6C63FF', fontSize: '15px' }}>{formatPrice(product.price)}<span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 500 }}>/{product.unit}</span></span>
                  <span style={{ padding: '4px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, background: product.in_stock ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: product.in_stock ? '#10B981' : '#EF4444' }}>
                    {product.in_stock ? '● In Stock' : '● Out'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', borderTop: `1px solid ${c('#F1F5F9', 'rgba(255,255,255,0.05)')}`, paddingTop: '16px' }}>
                  <button onClick={() => openEdit(product)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '10px', background: c('#F1F5F9', 'rgba(255,255,255,0.06)'), color: c('#334155', '#CBD5E1'), fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                    <Edit3 size={14} /> Edit
                  </button>
                  <button onClick={() => toggleStock(product)} style={{ padding: '8px', borderRadius: '10px', background: c('#F1F5F9', 'rgba(255,255,255,0.06)'), border: 'none', cursor: 'pointer' }}>
                    {product.in_stock ? <ToggleRight size={18} color="#10B981" /> : <ToggleLeft size={18} color="#94A3B8" />}
                  </button>
                  <button onClick={() => handleDelete(product.id)} style={{ padding: '8px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}>
                    <Trash2 size={16} color="#EF4444" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => setModal(false)}>
          <div style={{ background: c('white', '#0F172A'), borderRadius: '24px', padding: '32px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 48px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '24px' }}>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label style={labelStyle}>Product Name *</label><input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Amul Milk 500ml" style={inputStyle} /></div>
              <div><label style={labelStyle}>Description</label><input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description" style={inputStyle} /></div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Price (₹) *</label><input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0" style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Unit</label>
                  <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={labelStyle}>Category</label>
                <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Product Image</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', border: `1px dashed ${c('#CBD5E1', '#475569')}`, cursor: 'pointer', background: c('#F8FAFC', 'rgba(255,255,255,0.02)') }}>
                    <Upload size={16} color="#64748B" />
                    <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && uploadProductImage(e.target.files[0])} />
                  </label>
                  {form.image_url && <img src={form.image_url} alt="" style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} />}
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginTop: '8px' }}>
                <input type="checkbox" checked={form.in_stock} onChange={e => setForm(p => ({ ...p, in_stock: e.target.checked }))} style={{ width: '20px', height: '20px', accentColor: '#6C63FF' }} />
                <span style={{ fontSize: '14px', color: c('#334155', '#CBD5E1'), fontWeight: 600 }}>Item is in stock</span>
              </label>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={() => setModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: c('#F1F5F9', 'rgba(255,255,255,0.05)'), color: c('#475569', '#CBD5E1'), fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#6C63FF', color: 'white', fontWeight: 700, fontSize: '15px', border: 'none', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1, boxShadow: '0 4px 12px rgba(108,99,255,0.3)' }}>{saving ? '⏳ Saving...' : (editingProduct ? 'Save Changes' : 'Add Product')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
