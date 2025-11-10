'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'

export default function StickyHeader({ 
  companyName, 
  logoUrl, 
  primaryColor 
}: { 
  companyName: string
  logoUrl: string | null
  primaryColor: string
}) {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1])
  const headerBlur = useTransform(scrollY, [0, 100], [0, 10])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      style={{
        opacity: headerOpacity,
        backdropFilter: `blur(${headerBlur}px)`,
      }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-zinc-200'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl && (
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <Image
                src={logoUrl}
                alt={`${companyName} logo`}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          )}
          <span className={`font-semibold ${scrolled ? 'text-zinc-900' : 'text-white'}`}>
            {companyName}
          </span>
        </div>
        <Link
          href="#jobs"
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
            scrolled
              ? 'bg-zinc-900 text-white hover:bg-zinc-800'
              : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
          }`}
          style={scrolled ? {} : { backgroundColor: `${primaryColor}CC` }}
        >
          View Jobs
        </Link>
      </div>
    </motion.header>
  )
}

