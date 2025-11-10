'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function FilterSidebar({ locations, types, selectedLocation, selectedType }: any) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [location, setLocation] = useState(selectedLocation || '')
  const [type, setType] = useState(selectedType || '')

  // When dropdowns change, update URL but don't scroll or reload fully
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (location) params.set('location', location)
    else params.delete('location')

    if (type) params.set('type', type)
    else params.delete('type')

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [location, type])

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-sm text-gray-900 mb-2">Location</h4>
        <select
          className="w-full p-2 border rounded-lg text-sm"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map((loc: string) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h4 className="font-medium text-sm text-gray-900 mb-2">Employment Type</h4>
        <select
          className="w-full p-2 border rounded-lg text-sm"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          {types.map((t: string) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
