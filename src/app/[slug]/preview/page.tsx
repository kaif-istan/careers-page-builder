// src/app/[slug]/preview/page.tsx
import { createServerSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createServerSupabase()

  // FETCH COMPANY — SAFE: Use maybeSingle()
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()  // ← CRITICAL: Prevents crash

  if (companyError || !company) {
    console.log('Company not found:', companyError?.message)
    notFound()
  }

  // FETCH SECTIONS
  const { data: sections = [], error: sectionsError } = await supabase
    .from('company_sections')
    .select('*')
    .eq('company_id', company.id)
    .order('order_index')

  if (sectionsError) {
    console.error('Sections error:', sectionsError.message)
  }

  console.log("Banner URL", company.banner_url)
  console.log("Logo URL",company.logo_url)

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <div 
        className="relative h-96 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: company.banner_url 
            ? `url(${company.banner_url})` 
            : 'linear-gradient(to right, #3b82f6, #8b5cf6)'
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-6xl mx-auto px-6 h-full flex items-center">
          <div className="text-white">
            {company.logo_url ? (
              <div className="h-24 w-24 rounded-full mb-4 flex items-center justify-center">
                <Image 
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  width={100}
                  height={100}
                  className="h-full w-full rounded-full border-4 border-white mb-4"
                  // REMOVED onError — NOT ALLOWED IN SERVER COMPONENT
                />
              </div>
            ) : (
              <div className="h-24 w-24 rounded-full border-4 border-white mb-4 shadow-lg bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xs">No Logo</span>
              </div>
            )}
            <h1 className="text-5xl font-bold">{company.name} Careers</h1>
            <p className="text-xl mt-2">Join our growing team</p>
          </div>
        </div>
      </div>

      {/* CULTURE VIDEO */}
      {company.culture_video_url && (
        <div className="max-w-4xl mx-auto px-6 mt-12">
          <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
            <iframe
              src={company.culture_video_url.replace('watch?v=', 'embed/').split('&')[0]}
              className="w-full h-full"
              allowFullScreen
              title="Company Culture"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* CONTENT SECTIONS */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {sections!.length > 0 ? (
          sections!.map((s: any) => (
            <section key={s.id}>
              <h2 className="text-3xl font-bold mb-4">{s.title}</h2>
              <p className="text-lg text-gray-700 whitespace-pre-wrap">{s.content}</p>
              {s.image_url && (
                <div className="mt-6 rounded-lg overflow-hidden shadow-md">
                  <img 
                    src={s.image_url}
                    alt={s.title}
                    className="w-full max-h-96 object-cover"
                    // REMOVED onError
                  />
                </div>
              )}
            </section>
          ))
        ) : (
          <p className="text-center text-gray-500">No content sections yet. Add some in the editor!</p>
        )}
      </div>

      {/* CTA */}
      <div className="text-center pb-16">
        <Link 
          href={`/${slug}/careers`}
          className="inline-block bg-[#3E3ECC] hover:bg-[#2828d6] text-white px-8 py-4 rounded-lg text-lg font-semibold transition"
        >
          View Open Roles
        </Link>
      </div>
    </div>
  )
}