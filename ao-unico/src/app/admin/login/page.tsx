'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function Login() {
  const router = useRouter()
  const [erro, setErro] = useState('')
  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const { error } = await supabaseBrowser().auth.signInWithPassword({
      email: String(f.get('email')), password: String(f.get('senha')),
    })
    if (error) return setErro('Erro: ' + error.message)
    router.push('/admin'); router.refresh()
  }
  const campo = 'w-full border border-black p-3 text-base'
  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-6 text-3xl font-black uppercase">Painel</h1>
      <form onSubmit={entrar} className="grid gap-3">
        <input name="email" type="email" placeholder="E-mail" required className={campo} />
        <input name="senha" type="password" placeholder="Senha" required className={campo} />
        {erro && <p className="text-red-700">{erro}</p>}
        <button className="bg-black p-3 text-lg font-bold text-white">Entrar</button>
      </form>
    </main>
  )
}
