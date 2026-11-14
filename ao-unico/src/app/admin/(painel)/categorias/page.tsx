import { supabaseServer } from '@/lib/supabase/server'
import { createCategory, deleteCategory } from './actions'

type Category = {
  id: string
  name: string
  slug: string
  parent_id: string | null
  position: number
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteCategory}>
      <input type="hidden" name="id" value={id} />
      <button className="text-sm text-red-600 hover:underline">Excluir</button>
    </form>
  )
}

export default async function CategoriasPage() {
  const { data } = await supabaseServer()
    .from('categories')
    .select('id,name,slug,parent_id,position')
    .order('position')

  const cats: Category[] = data ?? []
  const topo = cats.filter((c) => !c.parent_id)

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
        <select name="parent_id" className="rounded border px-3 py-2">
          <option value="">Categoria principal</option>
          {topo.map((c) => (
            <option key={c.id} value={c.id}>
              Subcategoria de {c.name}
            </option>
          ))}
        </select>
        <button className="rounded bg-black px-4 py-2 font-semibold text-white">
          Adicionar
        </button>
      </form>

      <ul className="space-y-2">
        {topo.map((c) => (
          <li key={c.id} className="rounded border p-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold">{c.name}</span>
                <span className="ml-2 text-xs text-gray-500">/{c.slug}</span>
              </div>
              <DeleteButton id={c.id} />
            </div>

            <ul className="mt-2 space-y-1 border-l pl-4">
              {cats
                .filter((f) => f.parent_id === c.id)
                .map((f) => (
                  <li key={f.id} className="flex items-center justify-between">
                    <span>
                      {f.name}
                      <span className="ml-2 text-xs text-gray-500">/{f.slug}</span>
                    </span>
                    <DeleteButton id={f.id} />
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
