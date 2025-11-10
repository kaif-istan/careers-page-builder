// src/app/[slug]/careers/JobCard.tsx
import Link from 'next/link'

export default function JobCard({ job, companySlug }: { job: any; companySlug: string }) {
  return (
    <Link href={`/${companySlug}/jobs/${job.job_slug}`} className="block">
      <div className="border rounded-xl p-6 hover:shadow-lg transition-shadow bg-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {job.department} • {job.location}
            </p>
          </div>
          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
            {job.posted_days_ago}d ago
          </span>
        </div>

        <div className="mt-4 flex gap-3 text-sm">
          <span className="text-gray-700">{job.employment_type}</span>
          <span className="text-gray-700">{job.work_policy}</span>
          {job.salary_range && <span className="font-medium text-green-600">{job.salary_range}</span>}
        </div>

        <p className="mt-3 text-gray-600 line-clamp-2">{job.description}</p>
      </div>
    </Link>
  )
}