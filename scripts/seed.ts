import 'dotenv/config'


// scripts/seed.ts (updated)
import { createServerSupabase } from '@/lib/supabase'
import { type Job } from '../src/types/supabase'

async function seed() {
  const supabase = createServerSupabase()

  // 1. Create Company (if not exists)
  let { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', 'acme')
    .single()

  if (!company) {
    const { data } = await supabase
      .from('companies')
      .insert({
        slug: 'acme',
        name: 'Acme Inc.',
        logo_url: 'https://logo.clearbit.com/acme.com',
        banner_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c',
        primary_color: '#3b82f6',
        culture_video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      })
      .select()
      .single()
    company = data
  }

  if (!company) {
    throw new Error('Failed to create or find company')
  }

  console.log('Company ID:', company.id)

  // 2. Add Sections
const sections = [
  { type: 'about', title: 'About Us', content: 'We build amazing things.', order_index: 0 },
  { type: 'culture', title: 'Life at Acme', content: 'Ping pong, free lunch, and dogs.', order_index: 1 },
  { type: 'values', title: 'Our Values', content: 'Bold, Kind, Curious.', order_index: 2 },
]

await supabase
  .from('company_sections')
  .insert(sections.map((s, i) => ({ ...s, company_id: company.id, order_index: i })))

  // 2. Sample Jobs (matching new schema)
  const jobs  = [
    {
      title: 'Senior Frontend Engineer',
      work_policy: 'hybrid',
      location: 'San Francisco, CA',
      department: 'Engineering',
      employment_type: 'full-time',
      job_type: 'Individual Contributor',
      salary_range: '$140k–$180k',
      job_slug: 'senior-frontend-engineer-sf',
      posted_days_ago: 5,
    },
    {
      title: 'Product Designer',
      work_policy: 'remote',
      location: 'Remote (US)',
      department: 'Design',
      employment_type: 'full-time',
      job_type: 'Individual Contributor',
      salary_range: '$120k–$160k',
      job_slug: 'product-designer-remote',
      posted_days_ago: 12,
    },
    {
      title: 'Marketing Intern',
      work_policy: 'onsite',
      location: 'New York, NY',
      department: 'Marketing',
      employment_type: 'internship',
      job_type: 'Intern',
      salary_range: '$25/hr',
      job_slug: 'marketing-intern-nyc',
      posted_days_ago: 3,
    },
    {
      title: 'Backend Engineer',
      work_policy: 'remote',
      location: 'Remote (EU)',
      department: 'Engineering',
      employment_type: 'full-time',
      job_type: 'Individual Contributor',
      salary_range: '€90k–€130k',
      job_slug: 'backend-engineer-eu',
      posted_days_ago: 8,
    }
  ]

  await supabase
    .from('jobs')
    .upsert(jobs.map(j => ({ ...j, company_id: company.id })), { onConflict: 'job_slug' })

  console.log('Jobs seeded!')
}

seed().catch(console.error)