'use client'

export function JobCardSkeleton() {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-6 bg-zinc-200 rounded-lg w-3/4 mb-3" />
          <div className="flex gap-3">
            <div className="h-4 bg-zinc-200 rounded w-24" />
            <div className="h-4 bg-zinc-200 rounded w-32" />
            <div className="h-4 bg-zinc-200 rounded w-20" />
          </div>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-zinc-200 rounded-full w-20" />
        <div className="h-6 bg-zinc-200 rounded-full w-24" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-zinc-200 rounded w-full" />
        <div className="h-4 bg-zinc-200 rounded w-5/6" />
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="h-96 bg-zinc-200 animate-pulse rounded-2xl" />
  )
}

