'use server'

import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabase/server'

function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function createCategory(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const parentRaw = String(formData.get('parent_id') ?? '')
  const parent_id = parentRaw === '' ? null : parentRaw

  if (!name) throw new Error('Informe o nome da categoria')

  const supabase = supabaseServer()

  const { data: last } = await supabase
    .from('categories')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
  const position = (last?.[0]?.position ?? 0) + 1

  const { error } = await supabase
    .from('categories')
    .insert({ name, slug: slugify(name), parent_id, position })

  if (error) throw new Error(error.message)

  revalidatePath('/', 'layout')
  revalidatePath('/admin/categorias')
}

export async function deleteCategory(formData: FormData) {
  const id = String(formData.get('id'))
  const supabase = supabaseServer()

  const { count } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('parent_id', id)
  if (count && count > 0) {
    throw new Error('Exclua as subcategorias antes')
  }

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/', 'layout')
  revalidatePath('/admin/categorias')
}
