'use client'

import { useState } from 'react'
import Link from 'next/link'
import { addToCart } from '@/lib/cart'

type Variant = { id: string; size: string | null; color: string | null; stock: number }

export default function AddToCart({
  product,
  variants,
}: {
  product: { id: string; slug: string; name: string; price: number; image: string | null }
  variants: Variant[]
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  const escolhida = variants.find((v) => v.id === selected)

  function adicionar() {
    if (!escolhida) return
    addToCart({
      variantId: escolhida.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      size: escolhida.size,
      color: escolhida.color,
      image: product.image,
      stock: escolhida.stock,
    })
    setAdded(true)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const esgotado = v.stock <= 0
          const ativo = v.id === selected
          return (
            <button
              key={v.id}
              type="button"
              disabled={esgotado}
              onClick={() => {
                setSelected(v.id)
                setAdded(false)
              }}
              className={`border border-black px-4 py-2 font-semibold ${
                ativo ? 'bg-black text-white' : ''
              } ${esgotado ? 'text-neutral-400 line-through' : ''}`}
            >
              {[v.size, v.color].filter(Boolean).join(' · ')}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={adicionar}
        disabled={!escolhida}
        className="bg-black p-4 text-lg font-bold text-white disabled:opacity-40"
      >
        {escolhida ? 'Adicionar ao carrinho' : 'Escolha uma opção'}
      </button>

      {added && (
        <p className="font-semibold">
          Adicionado!{' '}
          <Link href="/carrinho" className="underline">
            Ver carrinho
          </Link>
        </p>
      )}
    </div>
  )
}
