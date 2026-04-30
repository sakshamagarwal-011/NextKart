import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Package, Search, ToggleLeft, ToggleRight, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../lib/utils';
import { CATEGORIES, UNITS } from '../../lib/constants';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const emptyProduct = { name: '', description: '', price: '', category_id: '', unit: 'piece', in_stock: true, image_url: '' };

export default function ProductsPage() {
  const { shop } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Products 📦</h1>
          <p className="text-dark-500 text-sm">{products.length} products</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>Add Product</Button>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
        <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 pl-10 pr-4 py-3 text-sm outline-none focus:border-primary-500 dark:text-white" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="No products" description="Add your first product to start selling!"
          action={<Button icon={Plus} onClick={openAdd}>Add Product</Button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product, i) => (
            <Card key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="h-36 -mx-5 -mt-5 mb-3 rounded-t-2xl overflow-hidden bg-dark-100 dark:bg-dark-700 relative">
                {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> :
                  <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>}
                {!product.in_stock && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-bold text-sm">Out of Stock</span></div>}
              </div>
              <h3 className="font-semibold text-dark-900 dark:text-white text-sm">{product.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-primary-500">{formatPrice(product.price)}<span className="text-dark-400 text-xs font-normal">/{product.unit}</span></span>
                <Badge status={product.in_stock ? 'in-stock' : 'out-of-stock'} dot>{product.in_stock ? 'In Stock' : 'Out'}</Badge>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-dark-100 dark:border-dark-700">
                <Button size="sm" variant="ghost" icon={Edit3} onClick={() => openEdit(product)}>Edit</Button>
                <button onClick={() => toggleStock(product)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 cursor-pointer">
                  {product.in_stock ? <ToggleRight size={18} className="text-success-500" /> : <ToggleLeft size={18} className="text-dark-400" />}
                </button>
                <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg hover:bg-accent-50 dark:hover:bg-accent-900/20 cursor-pointer ml-auto">
                  <Trash2 size={16} className="text-accent-500" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editingProduct ? 'Edit Product' : 'Add Product'} size="md">
        <div className="space-y-4">
          <div><label className="text-sm font-medium text-dark-700 dark:text-dark-300 block mb-1">Product Name *</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Amul Milk 500ml"
              className="w-full rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:text-white" /></div>
          <div><label className="text-sm font-medium text-dark-700 dark:text-dark-300 block mb-1">Description</label>
            <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description"
              className="w-full rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:text-white" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium text-dark-700 dark:text-dark-300 block mb-1">Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0"
                className="w-full rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:text-white" /></div>
            <div><label className="text-sm font-medium text-dark-700 dark:text-dark-300 block mb-1">Unit</label>
              <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                className="w-full rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:text-white">
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select></div>
          </div>
          <div><label className="text-sm font-medium text-dark-700 dark:text-dark-300 block mb-1">Category</label>
            <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
              className="w-full rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:text-white">
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select></div>
          <div><label className="text-sm font-medium text-dark-700 dark:text-dark-300 block mb-1">Product Image</label>
            <div className="flex gap-3 items-center">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-dark-300 dark:border-dark-600 cursor-pointer hover:border-primary-500 transition-colors">
                <Upload size={16} className="text-dark-400" /><span className="text-sm text-dark-500">{uploading ? 'Uploading...' : 'Upload'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadProductImage(e.target.files[0])} /></label>
              {form.image_url && <img src={form.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
            </div></div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.in_stock} onChange={e => setForm(p => ({ ...p, in_stock: e.target.checked }))} className="w-5 h-5 rounded accent-primary-500" />
            <span className="text-sm text-dark-700 dark:text-dark-300">In Stock</span></label>
          <Button onClick={handleSave} loading={saving} className="w-full">{editingProduct ? 'Save Changes' : 'Add Product'}</Button>
        </div>
      </Modal>
    </div>
  );
}
