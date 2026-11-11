import Link from 'next/link'
import Image from 'next/image'
import { supabaseServer } from '@/lib/supabase/server'
import { brl } from '@/lib/format'

export default async function Home() {
  const sb = supabaseServer()
  const [{ data: banner }, { data: produtos }] = await Promise.all([
    sb.from('banners').select('*').eq('active', true).order('position').limit(1).maybeSingle(),
    sb.from('products')
      .select('id,name,slug,price,sale_price,product_media(url,position)')
      .eq('status', 'published').order('created_at', { ascending: false }).limit(8),
  ])
  return (
    <main>
      <section className="grid bg-black text-white md:grid-cols-2">
        <div className="flex flex-col justify-center gap-5 p-8 md:p-14">
          <h1 className="text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
            {banner?.title ?? 'Vista a fé. Viva o propósito.'}
          </h1>
          <p className="max-w-md text-lg text-neutral-300">
            {banner?.subtitle ?? 'Bonés, shorts e meias para todos os estilos e idades.'}
          </p>
          <Link href={banner?.button_link ?? '/#lancamentos'} className="self-start bg-white px-8 py-4 text-lg font-extrabold text-black">
            {banner?.button_text ?? 'Ver lançamentos'}
          </Link>
        </div>
        {banner?.image_url && (
          <div className="relative min-h-[300px]"><Image src={banner.image_url} alt="" fill className="object-cover" priority sizes="50vw" /></div>
        )}
      </section>
      <section id="lancamentos" className="mx-auto max-w-6xl px-5 pt-14">
        <h2 className="mb-6 text-4xl font-black uppercase tracking-tight">Lançamentos</h2>
        {!produtos?.length && <p className="text-neutral-600">Em breve, novidades por aqui.</p>}
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {produtos?.map((p: any) => {
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
      </section>
    </main>
  )
}
