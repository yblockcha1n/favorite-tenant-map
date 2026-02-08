import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ categories: data })
}

export async function POST(request: NextRequest) {
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
      .insert({ name: name.trim() })
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

    return NextResponse.json({ category: data }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'リクエストの処理に失敗しました' },
      { status: 400 }
    )
  }
}
