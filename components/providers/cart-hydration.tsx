"use client"

import { useEffect } from "react"
import { useCartStore } from "@/store/cart-store"

/** Rehidrata el carrito persistido (localStorage) tras el montaje en cliente. */
export function CartHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate()
  }, [])

  return null
}
