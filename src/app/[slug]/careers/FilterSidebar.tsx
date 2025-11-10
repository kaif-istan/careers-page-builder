// src/app/[slug]/careers/FilterSidebar.tsx
'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export default function FilterSidebar({ locations, types, selectedLocation, selectedType }: any) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-sm text-gray-900 mb-2">Location</h4>
        <select
          className="w-full p-2 border rounded-lg text-sm"
          value={selectedLocation || ''}
          onChange={e => updateFilter('location', e.target.value || null)}
        >
          <option value="">All Locations</option>
          {locations.map((loc: string) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div>
        <h4 className="font-medium text-sm text-gray-900 mb-2">Employment Type</h4>
        <select
          className="w-full p-2 border rounded-lg text-sm"
          value={selectedType || ''}
          onChange={e => updateFilter('type', e.target.value || null)}
        >
          <option value="">All Types</option>
          {types.map((type: string) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    </div>
  )
}