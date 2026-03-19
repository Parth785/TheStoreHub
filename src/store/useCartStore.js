import { create } from 'zustand'

// helper to save cart to localStorage
const saveCart = (items) => {
  localStorage.setItem('cart', JSON.stringify(items))
}

// helper to load cart from localStorage
const loadCart = () => {
  try {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const useCartStore = create((set, get) => ({
  items: loadCart(), // load from localStorage on app start

  addItem: (product) => {
    const existing = get().items.find(i => i.id === product.id)
    let newItems
    if (existing) {
      newItems = get().items.map(i =>
        i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      )
    } else {
      newItems = [...get().items, { ...product, quantity: 1 }]
    }
    saveCart(newItems)
    set({ items: newItems })
  },

  removeItem: (id) => {
    const newItems = get().items.filter(i => i.id !== id)
    saveCart(newItems)
    set({ items: newItems })
  },

  updateQuantity: (id, quantity) => {
    let newItems
    if (quantity <= 0) {
      newItems = get().items.filter(i => i.id !== id)
    } else {
      newItems = get().items.map(i =>
        i.id === id ? { ...i, quantity } : i
      )
    }
    saveCart(newItems)
    set({ items: newItems })
  },

  clearCart: () => {
    localStorage.removeItem('cart')
    set({ items: [] })
  },

  getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}))

export default useCartStore