'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { MapPin, Clock, Briefcase, ArrowRight } from 'lucide-react'
import { Job } from '@/types/supabase'

export default function JobCard({ job, companySlug }: { job: Job & { description?: string }; companySlug: string }) {
  const workPolicyColors: Record<string, string> = {
    remote: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    hybrid: 'bg-amber-100 text-amber-700 border-amber-200',
    onsite: 'bg-blue-100 text-blue-700 border-blue-200',
  }

  const employmentTypeColors: Record<string, string> = {
    'full-time': 'bg-zinc-100 text-zinc-700 border-zinc-200',
    'part-time': 'bg-zinc-100 text-zinc-600 border-zinc-200',
    contract: 'bg-purple-100 text-purple-700 border-purple-200',
    internship: 'bg-pink-100 text-pink-700 border-pink-200',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={`/${companySlug}/jobs/${job.job_slug}`} className="block">
        <div className="relative bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-200 hover:border-zinc-300 overflow-hidden">
          {/* Gradient accent on hover */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-transparent group-hover:via-zinc-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-zinc-900 group-hover:text-zinc-950 transition-colors mb-2">
                  {job.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600">
                  {job.department && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      {job.department}
                    </span>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {job.posted_days_ago === 0 ? 'Today' : `${job.posted_days_ago}d ago`}
                  </span>
                </div>
              </div>
              <motion.div
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ x: 4 }}
              >
                <ArrowRight className="w-5 h-5 text-zinc-400" />
              </motion.div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${workPolicyColors[job.work_policy] || 'bg-zinc-100 text-zinc-700'}`}>
                {job.work_policy.charAt(0).toUpperCase() + job.work_policy.slice(1)}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${employmentTypeColors[job.employment_type] || 'bg-zinc-100 text-zinc-700'}`}>
                {job.employment_type.replace('-', ' ')}
              </span>
              {job.salary_range && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-white border border-zinc-900">
                  {job.salary_range}
                </span>
              )}
            </div>

            {/* Description preview */}
            {job.description && (
              <p className="text-zinc-600 text-sm line-clamp-2 leading-relaxed">
                {job.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
