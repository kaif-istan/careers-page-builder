// src/app/[slug]/careers/page.tsx
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import JobCard from './JobCard'
import FilterSidebar from './FilterSidebar'
import SearchInput from './SearchInput'

type Props = {
  params: { slug: string }
  searchParams: { q?: string; location?: string; type?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .eq('slug', params.slug)
    .single()

  return {
    title: `${company?.name || 'Careers'} | Open Roles`,
    description: `Join ${company?.name}. Explore open positions in engineering, design, and more.`,
    openGraph: {
      title: `${company?.name} Careers`,
      description: 'We are hiring!',
      type: 'website',
    },
  }
}

export default async function CareersPage({ params, searchParams }: Props) {
  const { slug } = await params
  const search = await searchParams.q?.toLowerCase() || ''
  const filterLocation = await searchParams.location
  const filterType =await  searchParams.type

  // Fetch company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single()

  if (companyError || !company) notFound()

  // Fetch sections
  const { data: sections } = await supabase
    .from('company_sections')
    .select('*')
    .eq('company_id', company.id)
    .order('order_index')

  // Fetch jobs
  let query = supabase
    .from('jobs')
    .select('*')
    .eq('company_id', company.id)

  if (filterLocation) query = query.eq('location', filterLocation)
  if (filterType) query = query.eq('employment_type', filterType)
  if (search) {
    query = query.or(`title.ilike.%${search}%,department.ilike.%${search}%`)
  }

  const { data: jobs } = await query.order('posted_days_ago')

  // Unique filter values
  const locations = [...new Set(jobs?.map(j => j.location).filter(Boolean))]
  const types = [...new Set(jobs?.map(j => j.employment_type).filter(Boolean))]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: company.name,
            url: `https://yourdomain.com/${slug}/careers`,
            logo: company.logo_url,
          }),
        }}
      />

      {/* Hero */}
      <header
        className="relative h-96 bg-cover bg-center"
        style={{ backgroundImage: company.banner_url ? `url(${company.banner_url})` : 'none' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative max-w-6xl mx-auto px-6 h-full flex items-center">
          <div>
            {company.logo_url && (
              <img src={company.logo_url} alt={`${company.name} logo`} className="h-20 w-20 rounded-full border-4 border-white mb-4" />
            )}
            <h1 className="text-5xl font-bold text-white">{company.name} Careers</h1>
            <p className="text-xl text-white mt-2">Join our team and build the future</p>
          </div>
        </div>
      </header>

      {/* Video */}
      {company.culture_video_url && (
        <section className="max-w-6xl mx-auto px-6 mt-12">
          <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
            <iframe
              src={company.culture_video_url.replace('watch?v=', 'embed/')}
              className="w-full h-full"
              allowFullScreen
              title="Culture Video"
            />
          </div>
        </section>
      )}

      {/* Content Sections */}
      {sections?.map((section: any) => (
        <section key={section.id} className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl font-bold text-gray-900">{section.title}</h2>
          <p className="mt-4 text-lg text-gray-700 whitespace-pre-wrap">{section.content}</p>
          {section.image_url && (
            <img src={section.image_url} alt={section.title} className="mt-6 rounded-xl shadow-md w-full max-h-96 object-cover" />
          )}
        </section>
      ))}

      {/* Jobs Section */}
      <section className="max-w-7xl mx-auto px-6 mt-20 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Open Roles</h2>

        <div className="flex gap-8 flex-col lg:flex-row">
          {/* Filters */}
          <aside className="lg:w-64 space-y-6">
            <SearchInput defaultValue={search} />
            <FilterSidebar
              locations={locations}
              types={types}
              selectedLocation={filterLocation}
              selectedType={filterType}
            />
          </aside>

          {/* Job List */}
          <div className="flex-1 space-y-6">
            {jobs?.length ? (
              jobs.map((job: any) => <JobCard key={job.id} job={job} companySlug={slug} />)
            ) : (
              <p className="text-center text-gray-500 py-12">No jobs match your filters.</p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}