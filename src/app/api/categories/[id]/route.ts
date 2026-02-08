import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userRole = request.headers.get('x-user-role')

  if (userRole !== 'admin') {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
  }

  try {
    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'カテゴリ名は必須です' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('categories')
      .update({ name: name.trim() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'このカテゴリ名は既に存在します' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ category: data })
  } catch {
    return NextResponse.json(
      { error: 'リクエストの処理に失敗しました' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userRole = request.headers.get('x-user-role')

  if (userRole !== 'admin') {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
  }

  const supabase = createServerSupabaseClient()

  // Check if any tenants are using this category
  const { count } = await supabase
    .from('tenants')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if (count && count > 0) {
    return NextResponse.json(
      { error: `このカテゴリは${count}件の店舗で使用中のため削除できません` },
      { status: 409 }
    )
  }

  const { error } = await supabase.from('categories').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
