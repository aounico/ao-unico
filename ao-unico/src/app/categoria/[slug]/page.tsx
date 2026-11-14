import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

const brl = (v: number) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string }
}) {
  const { slug } = await Promise.resolve(params)
  const supabase = supabaseServer()

  const { data: categoria } = await supabase
    .from('categories')
    .select('id,name,slug')
    .eq('slug', slug)
    .maybeSingle()

  if (!categoria) notFound()

  const { data: filhas } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', categoria.id)

  const ids = [categoria.id, ...(filhas ?? []).map((f: any) => f.id)]

  const { data } = await supabase
    .from('products')
    .select('id,name,slug,price,sale_price,product_media(url,kind,position)')
    .in('category_id', ids)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const produtos: any[] = data ?? []

  const capa = (p: any): string | null => {
    const imgs = (p.product_media ?? [])
      .filter((m: any) => m.kind === 'image')
      .sort((a: any, b: any) => a.position - b.position)
    return imgs[0]?.url ?? null
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="mb-6 text-3xl font-extrabold">{categoria.name}</h1>

      {produtos.length === 0 ? (
        <p className="text-gray-500">Nenhum produto nesta categoria ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {produtos.map((p) => {
            const foto = capa(p)
            return (
              <Link key={p.id} href={`/produto/${p.slug}`} className="group block">
                {foto ? (
                  <img
                    src={foto}
                    alt={p.name}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="aspect-square w-full bg-gray-200" />
                )}
                <h2 className="mt-2 font-semibold group-hover:underline">{p.name}</h2>
                {p.sale_price ? (
                  <p className="text-sm">
                    <span className="font-bold">{brl(p.sale_price)}</span>
                    <span className="ml-2 text-gray-500 line-through">{brl(p.price)}</span>
                  </p>
                ) : (
                  <p className="text-sm">{brl(p.price)}</p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
