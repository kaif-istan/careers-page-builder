// types/supabase.ts
export type Job = {
    id: string
    company_id: string
    title: string
    work_policy: 'remote' | 'hybrid' | 'onsite'
    location: string | null
    department: string | null
    employment_type: 'full-time' | 'part-time' | 'contract' | 'internship'
    job_type: string | null
    salary_range: string | null
    job_slug: string
    posted_days_ago: number
    created_at: string
  }