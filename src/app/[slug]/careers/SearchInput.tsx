'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [term, setTerm] = useState(defaultValue || '')

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(window.location.search)
    if (value) params.set('q', value)
    else params.delete('q')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, 400)

  useEffect(() => {
    handleSearch(term)
  }, [term])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Search job title..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
