'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCart, saveCart, type CartItem } from '@/lib/cart'
import { brl } from '@/lib/format'

export default function Carrinho() {
  const [items, setItems] = useState<CartItem[]>([])
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    setItems(getCart())
    setPronto(true)
  }, [])

  function atualizar(novos: CartItem[]) {
    setItems(novos)
    saveCart(novos)
  }

  function mudarQtd(variantId: string, delta: number) {
    atualizar(
      items.map((i) =>
        i.variantId === variantId
          ? { ...i, qty: Math.max(1, Math.min(i.qty + delta, i.stock)) }
          : i
      )
    )
  }

  function remover(variantId: string) {
    atualizar(items.filter((i) => i.variantId !== variantId))
  }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  if (!pronto) return null

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="mb-6 text-3xl font-black uppercase">Carrinho</h1>

      {items.length === 0 ? (
        <p>
          Seu carrinho está vazio.{' '}
          <Link href="/" className="underline">
            Continuar comprando
          </Link>
        </p>
      ) : (
        <>
          <ul className="divide-y border-y">
            {items.map((i) => (
              <li key={i.variantId} className="flex gap-4 py-4">
                {i.image ? (
                  <img src={i.image} alt={i.name} className="h-24 w-20 object-cover" />
                ) : (
                  <div className="h-24 w-20 bg-neutral-200" />
                )}
                <div className="flex flex-1 flex-col gap-1">
                  <Link href={`/produto/${i.slug}`} className="font-semibold hover:underline">
                    {i.name}
                  </Link>
                  <span className="text-sm text-neutral-600">
                    {[i.size, i.color].filter(Boolean).join(' · ')}
                  </span>
                  <span>{brl(i.price)}</span>
                  <div className="mt-1 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => mudarQtd(i.variantId, -1)}
                      className="h-8 w-8 border border-black"
                    >
                      −
                    </button>
                    <span>{i.qty}</span>
                    <button
                      type="button"
                      onClick={() => mudarQtd(i.variantId, 1)}
                      className="h-8 w-8 border border-black"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => remover(i.variantId)}
                      className="ml-4 text-sm text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  </div>
                </div>
                <div className="font-semibold">{brl(i.price * i.qty)}</div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between text-xl font-bold">
            <span>Total</span>
            <span>{brl(total)}</span>
          </div>

          <button
            type="button"
            disabled
            className="mt-6 w-full bg-black p-4 text-lg font-bold text-white opacity-40"
          >
            Finalizar compra (próximo passo)
          </button>
        </>
      )}
    </main>
  )
}
