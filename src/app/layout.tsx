import './globals.css'
import type { Metadata } from 'next'
import { Archivo } from 'next/font/google'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'

const archivo = Archivo({ subsets: ['latin'], weight: ['400', '600', '800', '900'] })

export const metadata: Metadata = {
  title: { default: 'AO ÚNICO', template: '%s | AO ÚNICO' },
  description: 'Bonés, shorts e meias. Vista a fé. Viva o propósito.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { data } = await supabaseServer().from('categories').select('id,name,slug,parent_id,position').order('position')
  const cats: any[] = data ?? []
  const topo = cats.filter((c) => !c.parent_id)
  return (
    <html lang="pt-BR">
      <body className={archivo.className}>
        <div className="bg-black py-2 text-center text-sm font-semibold text-white">
          Frete grátis acima de R$ 80 · Troca em até 7 dias · Pix e cartão
        </div>
        <header className="flex flex-col items-center gap-4 bg-black px-5 pb-6 pt-4 text-white">
          <Link href="/"><img src="/logo.png" alt="AO ÚNICO" className="h-20 w-auto md:h-28" /></Link>
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 font-semibold">
            <Link href="/#lancamentos">Lançamentos</Link>
            {topo.map((c) => {
              const filhos = cats.filter((f) => f.parent_id === c.id)
              return (
                <div key={c.id} className="group relative">
                  <Link href={`/categoria/${c.slug}`}>{c.name}</Link>
                  {filhos.length > 0 && (
                    <div className="absolute left-0 top-full z-10 hidden pt-2 group-focus-within:block group-hover:block">
                      <div className="min-w-48 border border-white bg-black p-3">
                        {filhos.map((f) => (
                          <Link key={f.id} href={`/categoria/${f.slug}`} className="block whitespace-nowrap py-1 font-normal">{f.name}</Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </header>
        {children}
        <footer className="mt-16 bg-black p-8 text-center text-sm text-white">
          AO ÚNICO · Araras – SP · Troca em até 7 dias
        </footer>
      </body>
    </html>
  )
}
