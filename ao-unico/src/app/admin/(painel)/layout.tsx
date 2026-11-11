import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'

async function sair() {
  'use server'
  await supabaseServer().auth.signOut()
  redirect('/admin/login')
}

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const sb = supabaseServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/admin/login')
  const { data: perfil } = await sb.from('profiles').select('role').eq('id', user.id).single()
  if (perfil?.role !== 'admin') redirect('/admin/login')
  return (
    <div className="mx-auto max-w-5xl p-5">
      <nav className="mb-6 flex items-center gap-5 border-b border-black pb-3 font-bold">
        <Link href="/admin">Painel</Link>
        <Link href="/admin/produtos/novo">Novo produto</Link>
        <Link href="/" className="ml-auto font-normal">Ver loja</Link>
        <form action={sair}><button className="font-normal underline">Sair</button></form>
      </nav>
      {children}
    </div>
  )
}
