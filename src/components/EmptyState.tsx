'use client'

import { motion } from 'framer-motion'
import { Briefcase, Search } from 'lucide-react'

export default function EmptyState({ 
  type = 'jobs',
  searchTerm 
}: { 
  type?: 'jobs' | 'sections'
  searchTerm?: string 
}) {
  if (type === 'jobs') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-6 text-center"
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-zinc-100 rounded-full blur-2xl opacity-50" />
          <div className="relative bg-zinc-50 rounded-full p-6">
            <Briefcase className="w-12 h-12 text-zinc-400" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-2">
          {searchTerm ? 'No jobs found' : 'No open positions'}
        </h3>
        <p className="text-zinc-600 max-w-md">
          {searchTerm
            ? `We couldn't find any jobs matching "${searchTerm}". Try adjusting your search or filters.`
            : "We don't have any open positions at the moment. Check back soon!"}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-zinc-100 rounded-full blur-2xl opacity-50" />
        <div className="relative bg-zinc-50 rounded-full p-6">
          <Search className="w-12 h-12 text-zinc-400" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-zinc-900 mb-2">
        No content sections yet
      </h3>
      <p className="text-zinc-600 max-w-md">
        Add some content sections in the editor to showcase your company culture, values, and benefits.
      </p>
    </motion.div>
  )
}

