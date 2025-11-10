'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { Search, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'

export default function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [term, setTerm] = useState(defaultValue || '')
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(window.location.search)
    if (value) params.set('q', value)
    else params.delete('q')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, 400)

  useEffect(() => {
    handleSearch(term)
  }, [term, handleSearch])

  const clearSearch = () => {
    setTerm('')
    handleSearch('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div
        className={`relative flex items-center transition-all duration-200 ${
          isFocused
            ? 'ring-2 ring-zinc-900 shadow-lg'
            : 'ring-1 ring-zinc-200 hover:ring-zinc-300'
        } rounded-xl bg-white`}
      >
        <Search className="absolute left-4 text-zinc-400 w-5 h-5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search jobs by title or department..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full pl-12 pr-10 py-3.5 bg-transparent border-0 rounded-xl text-sm placeholder:text-zinc-400 text-zinc-900 focus:outline-none focus:ring-0"
          aria-label="Search jobs"
        />
        {term && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={clearSearch}
            className="absolute right-3 p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
