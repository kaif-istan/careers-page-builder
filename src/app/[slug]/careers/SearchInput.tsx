// src/app/[slug]/careers/SearchInput.tsx
'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { Search } from 'lucide-react'

export default function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams()
    if (term) params.set('q', term)
    router.push(`${pathname}?${params.toString()}`)
  }, 300)

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Search job title..."
        defaultValue={defaultValue}
        onChange={e => handleSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}