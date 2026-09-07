import { create } from "zustand"
import { persist } from "zustand/middleware"

export type TipoEntrega = "domicilio" | "recoger"

export type CartItem = {
  productoId: string
  nombre: string
  precio: number
  imagenUrl: string | null
  cantidad: number
}

type CartState = {
  items: Record<string, CartItem>
  tipoEntrega: TipoEntrega
  isOpen: boolean
  add: (producto: { id: string; nombre: string; precio: number; imagenUrl: string | null }) => void
  increment: (productoId: string) => void
  decrement: (productoId: string) => void
  remove: (productoId: string) => void
  clear: () => void
  setTipoEntrega: (tipo: TipoEntrega) => void
  open: () => void
  close: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      tipoEntrega: "domicilio",
      isOpen: false,
      add: (producto) =>
        set((state) => {
          const existing = state.items[producto.id]
          return {
            items: {
              ...state.items,
              [producto.id]: {
                productoId: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagenUrl: producto.imagenUrl,
                cantidad: (existing?.cantidad ?? 0) + 1,
              },
            },
          }
        }),
      increment: (productoId) =>
        set((state) => {
          const existing = state.items[productoId]
          if (!existing) return state
          return {
            items: {
              ...state.items,
              [productoId]: { ...existing, cantidad: existing.cantidad + 1 },
            },
          }
        }),
      decrement: (productoId) =>
        set((state) => {
          const existing = state.items[productoId]
          if (!existing) return state
          if (existing.cantidad <= 1) {
            const rest = { ...state.items }
            delete rest[productoId]
            return { items: rest }
          }
          return {
            items: {
              ...state.items,
              [productoId]: { ...existing, cantidad: existing.cantidad - 1 },
            },
          }
        }),
      remove: (productoId) =>
        set((state) => {
          const rest = { ...state.items }
          delete rest[productoId]
          return { items: rest }
        }),
      clear: () => set({ items: {} }),
      setTipoEntrega: (tipo) => set({ tipoEntrega: tipo }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "el-bosque-carrito",
      skipHydration: true,
      partialize: (state) => ({ items: state.items, tipoEntrega: state.tipoEntrega }),
    }
  )
)

export function cartLines(items: Record<string, CartItem>): CartItem[] {
  return Object.values(items)
}

export function cartCount(items: Record<string, CartItem>): number {
  return Object.values(items).reduce((total, item) => total + item.cantidad, 0)
}

export function cartSubtotal(items: Record<string, CartItem>): number {
  return Object.values(items).reduce((total, item) => total + item.precio * item.cantidad, 0)
}
