// scripts/seed.ts
import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import XLSX from 'xlsx'
import slugify from 'slugify'
import { createServerSupabase } from '../src/lib/supabase' // adjust path if needed

// Company IDs (edit if changed)
const COMPANY_IDS = [
  '4969684c-0d36-48a9-b95c-48ab620906a0',
  'd0deb693-3292-4f36-84be-ff194fbfd745',
  '81eaf45a-5618-42fa-b78e-520a488c3c9b',
]

// Allowed enum values (per schema)
const ALLOWED_WORK_POLICIES = new Set(['remote', 'hybrid', 'onsite'])
const ALLOWED_EMPLOYMENT_TYPES = new Set([
  'full-time',
  'part-time',
  'contract',
  'internship',
])

// Helpers
function normalizeWorkPolicy(raw?: string) {
  if (!raw) return null
  const v = raw.toLowerCase()
  if (ALLOWED_WORK_POLICIES.has(v)) return v
  if (v.includes('remote')) return 'remote'
  if (v.includes('hybrid')) return 'hybrid'
  if (v.includes('on') || v.includes('site')) return 'onsite'
  return 'remote'
}

function normalizeEmploymentType(raw?: string) {
  if (!raw) return null
  const v = raw.toLowerCase()
  if (ALLOWED_EMPLOYMENT_TYPES.has(v)) return v
  if (v.includes('full')) return 'full-time'
  if (v.includes('part')) return 'part-time'
  if (v.includes('contract') || v.includes('temp')) return 'contract'
  if (v.includes('intern')) return 'internship'
  return 'full-time'
}

function parsePostedDays(raw?: string | number) {
  if (raw == null) return 0
  if (typeof raw === 'number') return Math.max(0, Math.floor(raw))
  const m = raw.toString().match(/(\d+)/)
  return m ? parseInt(m[1]) : 0
}

function safeSlug(input: string, index: number) {
  const base = slugify(input || `job-${index}`, { lower: true, strict: true })
  return `${base}-${index}` // ensure uniqueness across rows
}

// --- Main Seed ---
async function seed() {
  const supabase = createServerSupabase()
  const excelPath = path.resolve(process.cwd(), 'Sample Jobs Data.xlsx')

  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Excel file not found at ${excelPath}`)
    process.exit(1)
  }

  const workbook = XLSX.readFile(excelPath)
  const sheet = workbook.SheetNames[0]
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { defval: null })

  console.log(`📄 Loaded ${rows.length} rows from Excel`)

  // Prepare jobs
  const jobs = rows.map((r: any, idx: number) => {
    const title = (r.title ?? r.Title ?? '').toString().trim()
    if (!title) {
      console.warn(`⚠️ Row ${idx + 1}: Missing title — skipped`)
      return null
    }

    const work_policy = normalizeWorkPolicy(r.work_policy ?? r.WorkPolicy)
    const employment_type = normalizeEmploymentType(
      r.employment_type ?? r.EmploymentType
    )

    const job_slug = safeSlug(r.job_slug ?? title, idx)
    const company_id = COMPANY_IDS[idx % COMPANY_IDS.length]

    return {
      company_id,
      title,
      work_policy,
      location: r.location ?? null,
      department: r.department ?? null,
      employment_type,
      job_type: r.job_type ?? null,
      salary_range: r.salary_range ?? null,
      job_slug,
      posted_days_ago: parsePostedDays(r.posted_days_ago),
    }
  }).filter(Boolean)

  // Deduplicate job_slugs (Postgres will error if duplicates exist)
  const seen = new Set<string>()
  const uniqueJobs = jobs.filter((j) => {
    if (seen.has(j!.job_slug)) {
      console.warn(`⚠️ Duplicate job_slug "${j!.job_slug}" skipped`)
      return false
    }
    seen.add(j!.job_slug)
    return true
  })

  console.log(`🧮 ${uniqueJobs.length} unique jobs ready to insert`)

  // Insert in chunks to avoid Postgres ON CONFLICT issue
  const chunkSize = 50
  for (let i = 0; i < uniqueJobs.length; i += chunkSize) {
    const chunk = uniqueJobs.slice(i, i + chunkSize)
    const { error } = await supabase
      .from('jobs')
      .upsert(chunk, { onConflict: 'job_slug' })

    if (error) {
      console.error(`❌ Error inserting chunk ${i / chunkSize + 1}:`, error)
      process.exit(1)
    }
    console.log(`✅ Inserted chunk ${i / chunkSize + 1} (${chunk.length} jobs)`)
  }

  console.log('🎉 Job seeding completed successfully!')
}

seed().catch((err) => {
  console.error('💥 Unexpected error:', err)
  process.exit(1)
})
