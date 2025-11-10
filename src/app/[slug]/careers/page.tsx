// src/app/[slug]/careers/page.tsx
// IMPORTANT: This page ONLY reads from Supabase (published data)
// It NEVER uses localStorage or preview data - only shows published content
import { createServerSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import JobCard from './JobCard'
import FilterSidebar from './FilterSidebar'
import SearchInput from './SearchInput'
import StickyHeader from './StickyHeader'
import EmptyState from '@/components/EmptyState'
import Image from 'next/image'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ q?: string; location?: string; type?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServerSupabase()
  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .eq('slug', slug)
    .maybeSingle()

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
  const searchparams = await searchParams
  const search = searchparams.q?.toLowerCase() || ''
  const filterLocation = searchparams.location
  const filterType = searchparams.type

  const supabase = createServerSupabase()

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

  // Fetch all jobs first to get unique filter values
  const { data: allJobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', company.id)

  // Unique filter values from all jobs
  const locations = [...new Set(allJobs?.map(j => j.location).filter(Boolean) || [])]
  const types = [...new Set(allJobs?.map(j => j.employment_type).filter(Boolean) || [])]

  // Fetch filtered jobs
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

      {/* Sticky Header */}
      <StickyHeader 
        companyName={company.name} 
        logoUrl={company.logo_url}
        primaryColor={company.primary_color}
      />

      {/* Hero Section */}
      <header
        className="relative h-[600px] bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 overflow-hidden"
        style={{
          backgroundImage: company.banner_url ? `url(${company.banner_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/60" />
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center">
          <div className="max-w-3xl">
            {company.logo_url && (
              <div className="mb-8">
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl backdrop-blur-sm bg-white/10">
                  <Image
                    src={company.logo_url}
                    alt={`${company.name} logo`}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
              </div>
            )}
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
              {company.name} Careers
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Join our team and build the future together
            </p>
            <a
              href="#jobs"
              className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-xl font-semibold text-lg hover:bg-zinc-100 transition-all duration-200 hover:scale-105 shadow-xl"
              style={{ backgroundColor: company.primary_color || '#fff' }}
            >
              Explore Open Roles
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </header>

      {/* Culture Video */}
      {company.culture_video_url && (
        <section className="max-w-6xl mx-auto px-6 mt-20">
          <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-zinc-200">
            <iframe
              src={company.culture_video_url.replace('watch?v=', 'embed/').split('&')[0]}
              className="w-full h-full"
              allowFullScreen
              title="Company Culture Video"
              loading="lazy"
            />
          </div>
        </section>
      )}

      {/* Content Sections */}
      {sections && sections.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 mt-20 space-y-20">
          {sections.map((section: any, index: number) => (
            <section
              key={section.id}
              className={`flex flex-col gap-8 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
              } items-center`}
            >
              <div className="flex-1 space-y-4">
                <h2 className="text-4xl font-bold text-zinc-900 tracking-tight">
                  {section.title}
                </h2>
                <p className="text-lg text-zinc-600 leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </p>
              </div>
              {section.image_url && (
                <div className="flex-1 w-full">
                  <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video">
                    <Image
                      src={section.image_url}
                      alt={section.title}
                      fill
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {/* Jobs Section */}
      <section id="jobs" className="max-w-7xl mx-auto px-6 mt-32 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-zinc-900 mb-4 tracking-tight">
            Open Roles
          </h2>
          <p className="text-xl text-zinc-600">
            {jobs && jobs.length > 0
              ? `We're hiring ${jobs.length} ${jobs.length === 1 ? 'role' : 'roles'}`
              : "Explore opportunities to join our team"}
          </p>
        </div>

        <div className="flex gap-8 flex-col lg:flex-row">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-6">
              <SearchInput defaultValue={search} />
              <FilterSidebar
                locations={locations}
                types={types}
                selectedLocation={filterLocation}
                selectedType={filterType}
              />
            </div>
          </aside>

          {/* Job List */}
          <div className="flex-1 min-w-0">
            {jobs && jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job: any) => (
                  <JobCard key={job.id} job={job} companySlug={slug} />
                ))}
              </div>
            ) : (
              <EmptyState type="jobs" searchTerm={search} />
            )}
          </div>
        </div>
      </section>
    </>
  )
}
