// src/app/api/test-supabase/route.ts
import { createServerSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createServerSupabase()

    // Test: Insert a dummy company
    const { data, error } = await supabase
      .from('companies')
      .insert({
        slug: 'test-co',
        name: 'Test Company',
        primary_color: '#10b981'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, company: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}