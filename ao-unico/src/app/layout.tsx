import './globals.css'
import type { Metadata } from 'next'
import { Archivo } from 'next/font/google'
import Link from 'next/link'

const archivo = Archivo({ subsets: ['latin'], weight: ['400', '600', '800', '900'] })

export const metadata: Metadata = {
  title: { default: 'AO ÚNICO', template: '%s | AO ÚNICO' },
  description: 'Bonés, shorts e meias. Vista a fé. Viva o propósito.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={archivo.className}>
        <div className="bg-black py-2 text-center text-sm font-semibold text-white">
          Frete grátis acima de R$ 80 · Troca em até 7 dias · Pix e cartão
        </div>
        <header className="flex flex-col items-center gap-4 bg-black px-5 pb-6 pt-4 text-white">
          <Link href="/"><img src="/logo.png" alt="AO ÚNICO" className="h-20 w-auto md:h-28" /></Link>
          <nav className="flex gap-6 font-semibold"><Link href="/#lancamentos">Lançamentos</Link></nav>
        </header>
        {children}
        <footer className="mt-16 bg-black p-8 text-center text-sm text-white">
          AO ÚNICO · Araras – SP · Troca em até 7 dias
        </footer>
      </body>
    </html>
  )
}
