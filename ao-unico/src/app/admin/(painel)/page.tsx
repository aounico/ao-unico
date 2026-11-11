import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { brl } from '@/lib/format'

export default async function Painel() {
  const sb = supabaseServer()
  const head = { count: 'exact' as const, head: true }
  const [pedidos, pendentes, produtosQtd, baixo, vendas, lista] = await Promise.all([
    sb.from('orders').select('*', head),
    sb.from('orders').select('*', head).eq('status', 'pending'),
    sb.from('products').select('*', head),
    sb.from('product_variants').select('*', head).lte('stock', 3),
    sb.from('orders').select('total').in('status', ['paid', 'preparing', 'shipped', 'delivered']),
    sb.from('products').select('id,name,price,status').order('created_at', { ascending: false }),
  ])
  const total = (vendas.data ?? []).reduce((s: number, o: any) => s + Number(o.total), 0)
  const cards = [
    ['Pedidos', pedidos.count ?? 0], ['Vendas realizadas', brl(total)], ['Pedidos pendentes', pendentes.count ?? 0],
    ['Produtos cadastrados', produtosQtd.count ?? 0], ['Estoque baixo (3 ou menos)', baixo.count ?? 0],
  ]
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {cards.map(([t, v]) => (
          <div key={String(t)} className="border border-black p-4"><p className="text-sm">{t}</p><p className="text-2xl font-black">{v}</p></div>
        ))}
      </div>
      <h2 className="mb-3 mt-10 text-2xl font-black uppercase">Produtos</h2>
      <Link href="/admin/produtos/novo" className="mb-4 inline-block bg-black px-5 py-3 font-bold text-white">+ Novo produto</Link>
      <ul className="divide-y divide-neutral-300 border-y border-neutral-300">
        {lista.data?.map((p: any) => (
          <li key={p.id} className="flex justify-between py-3"><span>{p.name}</span>
            <span>{brl(p.price)} · {p.status === 'published' ? 'Publicado' : 'Rascunho'}</span></li>
        ))}
      </ul>
    </>
  )
}
