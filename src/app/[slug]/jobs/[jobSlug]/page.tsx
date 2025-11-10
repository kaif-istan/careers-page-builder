// src/app/[slug]/jobs/[jobSlug]/page.tsx
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export default async function JobDetail({ params }: { params: Promise<{ slug: string; jobSlug: string }> }) {
  // UNWRAP THE PROMISE FIRST
  const { slug, jobSlug } = await params

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('job_slug', jobSlug)
    .eq('company_id', (
      await supabase
        .from('companies')
        .select('id')
        .eq('slug', slug)
        .single()
    ).data?.id)
    .single()

  if (error || !job) {
    console.log('Job not found or error:', error?.message)
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold">{job.title}</h1>
      <p className="text-lg text-gray-600 mt-2">
        {job.location} • {job.employment_type} • {job.work_policy}
      </p>
      {job.salary_range && (
        <p className="text-green-600 font-medium mt-1">{job.salary_range}</p>
      )}
      <div className="mt-8 prose max-w-none" dangerouslySetInnerHTML={{ __html: job.description || '' }} />
      <div className="mt-6 text-sm text-gray-500">
        Posted {job.posted_days_ago} days ago
      </div>
    </div>
  )
}