// src/app/[slug]/preview/page.tsx
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function PreviewPage({ params }: { params: { slug: string } }) {
  // FETCH COMPANY SAFELY
  const {slug} = await params
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single()

  // IF NOT FOUND → 404
  if (companyError || !company) {
    console.log('Company not found:', companyError?.message)
    notFound()
  }

  // FETCH SECTIONS SAFELY
  const { data: sections, error: sectionsError } = await supabase
    .from('company_sections')
    .select('*')
    .eq('company_id', company.id)
    .order('order_index')

  // IF ERROR → still show page (sections optional)
  if (sectionsError) {
    console.error('Sections error:', sectionsError.message)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div 
        className="relative h-96 bg-cover bg-center"
        style={{ 
          backgroundImage: company.banner_url 
            ? `url(${company.banner_url})` 
            : 'linear-gradient(to right, #3b82f6, #8b5cf6)'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative max-w-6xl mx-auto px-6 h-full flex items-center">
          <div className="text-white">
            {company.logo_url && (
              <img 
                src={company.logo_url} 
                alt={`${company.name} logo`} 
                className="h-24 w-24 rounded-full border-4 border-white mb-4 shadow-lg" 
              />
            )}
            <h1 className="text-5xl font-bold">{company.name} Careers</h1>
            <p className="text-xl mt-2">Join our growing team</p>
          </div>
        </div>
      </div>

      {/* Culture Video */}
      {company.culture_video_url && (
        <div className="max-w-4xl mx-auto px-6 mt-12">
          <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
            <iframe
              src={company.culture_video_url.replace('watch?v=', 'embed/')}
              className="w-full h-full"
              allowFullScreen
              title="Company Culture"
            />
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {sections && sections.length > 0 ? (
          sections.map((s: any) => (
            <section key={s.id}>
              <h2 className="text-3xl font-bold mb-4">{s.title}</h2>
              <p className="text-lg text-gray-700 whitespace-pre-wrap">{s.content}</p>
              {s.image_url && (
                <img 
                  src={s.image_url} 
                  alt={s.title} 
                  className="mt-6 rounded-lg w-full max-h-96 object-cover shadow-md" 
                />
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
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition"
        >
          View Open Roles
        </Link>
      </div>
    </div>
  )
}