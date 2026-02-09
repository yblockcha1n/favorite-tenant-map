import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/auth/password'

export async function POST() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Admin seed environment variables not configured' },
        { status: 500 }
      )
    }

    const supabase = createServerSupabaseClient()

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminEmail)
      .single()

    if (existing) {
      return NextResponse.json(
        { message: 'Admin user already exists', id: existing.id },
        { status: 200 }
      )
    }

    const password_hash = await hashPassword(adminPassword)

    const { data: admin, error } = await supabase
      .from('users')
      .insert({
        email: adminEmail,
        password_hash,
        name: 'Master Admin',
        role: 'admin',
      })
      .select('id, email, name, role')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to seed admin user', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Admin user seeded successfully', admin },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
