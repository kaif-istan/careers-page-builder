'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, MapPin, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function FilterSidebar({ 
  locations, 
  types, 
  selectedLocation, 
  selectedType 
}: { 
  locations: string[]
  types: string[]
  selectedLocation?: string
  selectedType?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [location, setLocation] = useState(selectedLocation || '')
  const [type, setType] = useState(selectedType || '')

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (location) params.set('location', location)
    else params.delete('location')

    if (type) params.set('type', type)
    else params.delete('type')

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [location, type, pathname, router, searchParams])

  const clearFilters = () => {
    setLocation('')
    setType('')
  }

  const hasActiveFilters = location || type

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Active Filters</span>
              <button
                onClick={clearFilters}
                className="text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {location && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-full text-sm"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {location}
                  <button
                    onClick={() => setLocation('')}
                    className="ml-1 hover:bg-zinc-200 rounded-full p-0.5 transition-colors"
                    aria-label="Remove location filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
              {type && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-full text-sm"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  {type.replace('-', ' ')}
                  <button
                    onClick={() => setType('')}
                    className="ml-1 hover:bg-zinc-200 rounded-full p-0.5 transition-colors"
                    aria-label="Remove type filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Filter */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 mb-3">
          <MapPin className="w-4 h-4 text-zinc-500" />
          Location
        </label>
        <div className="space-y-2">
          <button
            onClick={() => setLocation('')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              !location
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            All Locations
          </button>
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => setLocation(loc)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                location === loc
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Employment Type Filter */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 mb-3">
          <Briefcase className="w-4 h-4 text-zinc-500" />
          Employment Type
        </label>
        <div className="space-y-2">
          <button
            onClick={() => setType('')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              !type
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            All Types
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${
                type === t
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {t.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
