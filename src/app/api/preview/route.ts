// src/app/api/preview/route.ts
import { createServerSupabase } from '@/lib/supabase'
import { getServerSession } from '@/lib/auth-server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Auth check - must be logged in to access preview API
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    // Try to get preview data from cookie
    const cookieStore = await cookies()
    const previewCookie = cookieStore.get(`preview_${slug}`)
    
    let previewData: { company: any; sections: any[] } | null = null

    if (previewCookie) {
      try {
        previewData = JSON.parse(decodeURIComponent(previewCookie.value))
      } catch (error) {
        console.error('Failed to parse preview cookie:', error)
      }
    }

    // If no preview data, fallback to published data from Supabase
    const supabase = createServerSupabase()
    
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const { data: sections = [] } = await supabase
      .from('company_sections')
      .select('*')
      .eq('company_id', company.id)
      .order('order_index')

    // Use preview data if available, otherwise use published data
    const finalCompany = previewData?.company 
      ? { ...company, ...previewData.company }
      : company
    
    const finalSections = previewData?.sections || sections

    return NextResponse.json({
      company: finalCompany,
      sections: finalSections,
      isPreview: !!previewData,
    })
  } catch (error: any) {
    console.error('Preview API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

