import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('tenants')
    .select('*, categories(name), users!tenants_created_by_fkey(name)')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json({ tenant: data })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabaseClient()

  const { data: existing } = await supabase
    .from('tenants')
    .select('created_by')
    .eq('id', id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 })
  }

  if (existing.created_by !== userId && userRole !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
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

    const { data, error } = await supabase
      .from('tenants')
      .update({
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
      })
      .eq('id', id)
      .select('*, categories(name)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tenant: data })
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
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabaseClient()

  const { data: existing } = await supabase
    .from('tenants')
    .select('created_by')
    .eq('id', id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 })
  }

  if (existing.created_by !== userId && userRole !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { error } = await supabase.from('tenants').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
