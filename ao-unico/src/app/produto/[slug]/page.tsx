import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { supabaseServer } from '@/lib/supabase/server'
import { brl } from '@/lib/format'
import AddToCart from '@/components/AddToCart'

async function getProduct(slug: string) {
  const { data } = await supabaseServer().from('products')
    .select('*,product_media(url,kind,position),product_variants(id,size,color,stock)')
    .eq('slug', slug).eq('status', 'published').maybeSingle()
  return data
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProduct(params.slug)
  return { title: p?.name, description: p?.seo_description || p?.description?.slice(0, 150) }
}

export default async function Produto({ params }: { params: { slug: string } }) {
  const p = await getProduct(params.slug)
  if (!p) notFound()
  const midias = [...(p.product_media ?? [])].sort((a: any, b: any) => a.position - b.position)
  const preco = p.sale_price ?? p.price
  const capa = midias.find((m: any) => m.kind !== 'video')?.url ?? null
  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-5 pt-10 md:grid-cols-2">
      <div className="grid gap-3">
        {midias.map((m: any) => m.kind === 'video'
          ? <video key={m.url} src={m.url} controls className="w-full" />
          : <div key={m.url} className="relative aspect-[3/4] bg-neutral-200"><Image src={m.url} alt={p.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" /></div>)}
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-black uppercase tracking-tight">{p.name}</h1>
        <p className="text-2xl font-semibold">{brl(preco)}</p>
        <p className="whitespace-pre-line text-lg text-neutral-700">{p.description}</p>
        <AddToCart
          product={{ id: p.id, slug: p.slug, name: p.name, price: Number(preco), image: capa }}
          variants={p.product_variants ?? []}
        />
      </div>
    </main>
  )
}
