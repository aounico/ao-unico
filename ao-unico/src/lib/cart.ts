export type CartItem = {
  variantId: string
  productId: string
  slug: string
  name: string
  price: number
  size: string | null
  color: string | null
  image: string | null
  stock: number
  qty: number
}

const KEY = 'ao-unico-cart'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
    window.dispatchEvent(new Event('cart-change'))
  } catch {}
}

export function addToCart(item: Omit<CartItem, 'qty'>) {
  const cart = getCart()
  const found = cart.find((i) => i.variantId === item.variantId)
  if (found) {
    found.qty = Math.min(found.qty + 1, item.stock)
  } else {
    cart.push({ ...item, qty: 1 })
  }
  saveCart(cart)
}
