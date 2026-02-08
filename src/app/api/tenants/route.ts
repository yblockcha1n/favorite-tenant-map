import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('tenants')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tenants: data })
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      name,
      category_id,
      address,
      latitude,
      longitude,
      phone,
      url1,
      url2,
      url3,
      memo,
    } = body

    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: '店舗名、緯度、経度は必須です' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('tenants')
      .insert({
        name,
        category_id: category_id || null,
        address: address || null,
        latitude,
        longitude,
        phone: phone || null,
        url1: url1 || null,
        url2: url2 || null,
        url3: url3 || null,
        memo: memo || null,
        created_by: userId,
      })
      .select('*, categories(name)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tenant: data }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'リクエストの処理に失敗しました' },
      { status: 400 }
    )
  }
}
