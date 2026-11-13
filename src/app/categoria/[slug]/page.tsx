import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabaseServer } from '@/lib/supabase/server'
import { brl } from '@/lib/format'

async function getCategoria(slug: string) {
  const sb = supabaseServer()
  const { data: cat } = await sb.from('categories').select('id,name,slug').eq('slug', slug).maybeSingle()
  if (!cat) return null
  const { data: filhos } = await sb.from('categories').select('id,name,slug').eq('parent_id', cat.id).order('position')
  const ids = [cat.id, ...(filhos ?? []).map((f: any) => f.id)]
  const { data: produtos } = await sb.from('products')
    .select('id,name,slug,price,sale_price,product_media(url,position)')
    .eq('status', 'published').in('category_id', ids).order('created_at', { ascending: false })
  return { cat, filhos: filhos ?? [], produtos: produtos ?? [] }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const r = await getCategoria(params.slug)
  return { title: r?.cat.name }
}

export default async function Categoria({ params }: { params: { slug: string } }) {
  const r = await getCategoria(params.slug)
  if (!r) notFound()
  return (
    <main className="mx-auto max-w-6xl px-5 pt-10">
      <h1 className="mb-4 text-4xl font-black uppercase tracking-tight">{r.cat.name}</h1>
      {r.filhos.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {r.filhos.map((f: any) => (
            <Link key={f.id} href={`/categoria/${f.slug}`} className="border border-black px-4 py-2 font-semibold">{f.name}</Link>
          ))}
        </div>
      )}
      {r.produtos.length === 0 && <p className="text-neutral-600">Em breve, novidades nesta categoria.</p>}
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {r.produtos.map((p: any) => {
          const foto = [...(p.product_media ?? [])].sort((a: any, b: any) => a.position - b.position)[0]?.url
          return (
            <Link key={p.id} href={`/produto/${p.slug}`}>
              <div className="relative aspect-[3/4] bg-neutral-200">
                {foto && <Image src={foto} alt={p.name} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />}
              </div>
              <p className="mt-2 font-semibold">{p.name}</p>
              <p className="text-neutral-700">
                {p.sale_price ? <><s className="mr-2 text-neutral-500">{brl(p.price)}</s>{brl(p.sale_price)}</> : brl(p.price)}
              </p>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
