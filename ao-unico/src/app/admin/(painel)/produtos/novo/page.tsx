import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { slugify } from '@/lib/format'

async function criar(f: FormData) {
  'use server'
  const sb = supabaseServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/admin/login')
  const nome = String(f.get('nome')).trim()
  const slug = slugify(nome)
  const categoria = String(f.get('categoria') ?? '')
  const { data: p, error } = await sb.from('products').insert({
    name: nome, slug, description: String(f.get('descricao')),
    price: Number(f.get('preco')), status: f.get('publicar') ? 'published' : 'draft',
    category_id: categoria || null,
  }).select('id').single()
  if (error || !p) throw new Error(error?.message ?? 'Erro ao salvar')

  const variacoes = String(f.get('variacoes')).split('\n').map((l) => l.trim()).filter(Boolean)
    .map((l, i) => {
      const [size, color, stock] = l.split(',').map((s) => s.trim())
      return { product_id: p.id, sku: `${slug}-${i + 1}`.toUpperCase(), size: size || null, color: color || null, stock: Number(stock) || 0 }
    })
  if (variacoes.length) await sb.from('product_variants').insert(variacoes)

  const foto = f.get('foto') as File | null
  if (foto && foto.size > 0) {
    const ext = foto.name.split('.').pop()
    const path = `produtos/${p.id}-${Date.now()}.${ext}`
    await sb.storage.from('media').upload(path, foto, { contentType: foto.type })
    const { data } = sb.storage.from('media').getPublicUrl(path)
    await sb.from('product_media').insert({ product_id: p.id, url: data.publicUrl })
  }
  redirect('/admin')
}

export default async function NovoProduto() {
  const campo = 'w-full border border-black p-3 text-base'

  const { data } = await supabaseServer()
    .from('categories')
    .select('id,name,parent_id,position')
    .order('position')
  const cats: any[] = data ?? []
  const topo = cats.filter((c) => !c.parent_id)

  return (
    <form action={criar} className="grid max-w-xl gap-3">
      <h1 className="text-3xl font-black uppercase">Novo produto</h1>
      <input name="nome" placeholder="Nome do produto" required className={campo} />
      <textarea name="descricao" placeholder="Descrição" rows={4} className={campo} />
      <input name="preco" type="number" step="0.01" min="0" placeholder="Preço (ex.: 79.90)" required className={campo} />

      <label className="font-semibold">Categoria
        <select name="categoria" required className={`${campo} mt-1 bg-white`}>
          <option value="">Escolha uma categoria</option>
          {topo.map((pai) => {
            const filhas = cats.filter((c) => c.parent_id === pai.id)
            return filhas.length > 0 ? (
              <optgroup key={pai.id} label={pai.name}>
                {filhas.map((f) => (
                  <option key={f.id} value={f.id}>{pai.name} › {f.name}</option>
                ))}
              </optgroup>
            ) : (
              <option key={pai.id} value={pai.id}>{pai.name}</option>
            )
          })}
        </select>
      </label>

      <label className="font-semibold">Variações (uma por linha: tamanho, cor, estoque)
        <textarea name="variacoes" rows={4} placeholder={'P, Preto, 10\nM, Preto, 8\nÚnico, Branco, 5'} className={campo} />
      </label>
      <label className="font-semibold">Foto principal
        <input name="foto" type="file" accept="image/*" className="mt-1 block" />
      </label>
      <label className="flex items-center gap-2"><input name="publicar" type="checkbox" /> Publicar na loja agora</label>
      <button className="bg-black p-3 text-lg font-bold text-white">Salvar produto</button>
    </form>
  )
}
