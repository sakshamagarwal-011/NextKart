export const AREAS = [
  'Indirapuram',
  'Raj Nagar Extension',
  'Vaishali',
  'Kaushambi',
  'Crossing Republik',
  'Vasundhara',
  'Ahinsa Khand',
  'Shakti Khand',
  'Nyay Khand',
  'Abhay Khand',
  'Niti Khand',
  'Shipra Suncity',
  'Gaur City',
  'Raj Nagar',
];

export const CATEGORIES = [
  { id: 'dairy', name: 'Dairy & Milk', icon: '🥛' },
  { id: 'snacks', name: 'Snacks & Chips', icon: '🍿' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' },
  { id: 'groceries', name: 'Groceries', icon: '🛒' },
  { id: 'personal-care', name: 'Personal Care', icon: '🧴' },
  { id: 'household', name: 'Household', icon: '🏠' },
  { id: 'fruits-vegetables', name: 'Fruits & Vegetables', icon: '🥬' },
  { id: 'bakery', name: 'Bakery', icon: '🍞' },
  { id: 'frozen', name: 'Frozen Food', icon: '🧊' },
  { id: 'baby-care', name: 'Baby Care', icon: '🍼' },
  { id: 'pet-care', name: 'Pet Care', icon: '🐾' },
  { id: 'stationery', name: 'Stationery', icon: '📝' },
];

export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-warning-400 text-dark-900', icon: '⏳' },
  accepted: { label: 'Accepted', color: 'bg-blue-500 text-white', icon: '✅' },
  rejected: { label: 'Rejected', color: 'bg-accent-500 text-white', icon: '❌' },
  preparing: { label: 'Preparing', color: 'bg-purple-500 text-white', icon: '👨‍🍳' },
  delivered: { label: 'Delivered', color: 'bg-success-500 text-white', icon: '📦' },
  cancelled: { label: 'Cancelled', color: 'bg-dark-400 text-white', icon: '🚫' },
};

export const PAYMENT_METHODS = {
  cod: { label: 'Cash on Delivery', icon: '💵', description: 'Pay when you receive your order' },
  upi: { label: 'UPI Payment', icon: '📱', description: 'Pay via UPI to the shopkeeper' },
};

export const UNITS = ['piece', 'kg', 'gram', 'liter', 'ml', 'pack', 'dozen', 'bottle'];
