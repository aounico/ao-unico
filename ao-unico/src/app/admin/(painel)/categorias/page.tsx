import { supabaseServer } from '@/lib/supabase/server'
import { createCategory, deleteCategory } from './actions'

type Category = {
  id: string
  name: string
  slug: string
  position: number
}

export default async function CategoriasPage() {
  const { data } = await supabaseServer()
    .from('categories')
    .select('id,name,slug,position')
    .order('position')

  const cats: Category[] = data ?? []

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <h1 className="text-2xl font-bold">Categorias</h1>

      <form action={createCategory} className="flex flex-col gap-3 rounded border p-4 sm:flex-row">
        <input
          name="name"
          required
          placeholder="Nome da categoria"
          className="flex-1 rounded border px-3 py-2"
        />
        <button className="rounded bg-black px-4 py-2 font-semibold text-white">
          Adicionar
        </button>
      </form>

      <ul className="space-y-2">
        {cats.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded border p-3">
            <div>
              <span className="font-semibold">{c.name}</span>
              <span className="ml-2 text-xs text-gray-500">/{c.slug}</span>
            </div>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={c.id} />
              <button className="text-sm text-red-600 hover:underline">Excluir</button>
            </form>
          </li>
        ))}

        {cats.length === 0 && (
          <li className="text-sm text-gray-500">Nenhuma categoria criada ainda.</li>
        )}
      </ul>
    </div>
  )
}
