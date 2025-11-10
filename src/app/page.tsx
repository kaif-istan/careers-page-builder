// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { supabase } from '@/lib/supabase'
// import { motion } from 'motion/react'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Loader2, LogOut, Edit, Eye, ExternalLink, Sparkles } from 'lucide-react'
// import Link from 'next/link'
// import Image from 'next/image'

// export default function Home() {
//   const router = useRouter()
//   const [user, setUser] = useState<any>(null)
//   const [company, setCompany] = useState<any>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     // Check auth state
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       if (session) {
//         setUser(session.user)
//         // Fetch company
//         supabase
//           .from('companies')
//           .select('*')
//           .eq('slug', 'acme')
//           .single()
//           .then(({ data }) => {
//             setCompany(data)
//             setLoading(false)
//           })
//       } else {
//         setLoading(false)
//         // Redirect to login after a brief delay
//         setTimeout(() => {
//           router.push('/login')
//         }, 500)
//       }
//     })

//     // Listen for auth changes
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       if (session) {
//         setUser(session.user)
//       } else {
//         router.push('/login')
//       }
//     })

//     return () => subscription.unsubscribe()
//   }, [router])

//   const logout = async () => {
//     await supabase.auth.signOut()
//     router.push('/login')
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100">
//         <div className="text-center">
//           <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mx-auto mb-4" />
//           <p className="text-zinc-600">Loading...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!user || !company) {
//     return null // Will redirect
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 p-8">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="flex justify-between items-center mb-12"
//         >
//           <div>
//             <h1 className="text-4xl font-bold text-zinc-900 mb-2 tracking-tight">
//               Welcome back! 👋
//             </h1>
//             <p className="text-zinc-600">
//               Logged in as <span className="font-semibold">{user.email}</span>
//             </p>
//           </div>
//           <Button
//             variant="outline"
//             onClick={logout}
//             className="gap-2 rounded-xl"
//           >
//             <LogOut className="w-4 h-4" />
//             Logout
//           </Button>
//         </motion.div>

//         {/* Company Card */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//         >
//           <Card className="border-zinc-200 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
//             <CardHeader className="bg-linear-to-r from-blue-600 to-purple-600 text-white p-8">
//               <div className="flex items-center gap-6">
//                 {company.logo_url && (
//                   <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white/20 shadow-lg bg-white/10 backdrop-blur-sm">
//                     <Image
//                       src={company.logo_url}
//                       alt={`${company.name} logo`}
//                       width={80}
//                       height={80}
//                       className="object-cover w-full h-full"
//                     />
//                   </div>
//                 )}
//                 <div className="flex-1">
//                   <CardTitle className="text-3xl font-bold mb-2 text-white">
//                     {company.name}
//                   </CardTitle>
//                   <p className="text-white/80">
//                     Slug: <code className="bg-white/20 px-2 py-1 rounded text-sm">{company.slug}</code>
//                   </p>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent className="p-8">
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">
//                     Quick Actions
//                   </h3>
//                   <div className="space-y-3">
//                     <Button
//                       asChild
//                       className="w-full justify-start gap-3 h-12 rounded-xl"
//                       style={{ backgroundColor: company.primary_color || '#3b82f6' }}
//                     >
//                       <Link href={`/${company.slug}/edit`}>
//                         <Edit className="w-5 h-5" />
//                         Edit Careers Page
//                       </Link>
//                     </Button>
//                     <Button
//                       asChild
//                       variant="outline"
//                       className="w-full justify-start gap-3 h-12 rounded-xl"
//                     >
//                       <Link href={`/${company.slug}/preview`} target="_blank">
//                         <Eye className="w-5 h-5" />
//                         Preview Page
//                         <ExternalLink className="w-4 h-4 ml-auto" />
//                       </Link>
//                     </Button>
//                     <Button
//                       asChild
//                       variant="outline"
//                       className="w-full justify-start gap-3 h-12 rounded-xl"
//                     >
//                       <Link href={`/${company.slug}/careers`} target="_blank">
//                         <Sparkles className="w-5 h-5" />
//                         View Public Page
//                         <ExternalLink className="w-4 h-4 ml-auto" />
//                       </Link>
//                     </Button>
//                   </div>
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">
//                     Brand Settings
//                   </h3>
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
//                       <span className="text-sm font-medium text-zinc-700">Primary Color</span>
//                       <div className="flex items-center gap-2">
//                         <div
//                           className="w-8 h-8 rounded-lg border-2 border-zinc-200"
//                           style={{ backgroundColor: company.primary_color }}
//                         />
//                         <code className="text-sm text-zinc-600">{company.primary_color}</code>
//                       </div>
//                     </div>
//                     <div className="p-4 bg-zinc-50 rounded-xl">
//                       <span className="text-sm font-medium text-zinc-700 block mb-2">
//                         Logo
//                       </span>
//                       {company.logo_url ? (
//                         <div className="text-xs text-zinc-500 truncate">{company.logo_url}</div>
//                       ) : (
//                         <div className="text-xs text-zinc-400">No logo set</div>
//                       )}
//                     </div>
//                     <div className="p-4 bg-zinc-50 rounded-xl">
//                       <span className="text-sm font-medium text-zinc-700 block mb-2">
//                         Banner
//                       </span>
//                       {company.banner_url ? (
//                         <div className="text-xs text-zinc-500 truncate">{company.banner_url}</div>
//                       ) : (
//                         <div className="text-xs text-zinc-400">No banner set</div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </motion.div>
//       </div>
//     </div>
//   )
// }


// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, LogOut, Edit, Eye, ExternalLink, Sparkles, Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        fetchCompanies()
      } else {
        setLoading(false)
        setTimeout(() => router.push('/login'), 500)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/login')
      else setUser(session.user)
    })

    return () => subscription.unsubscribe()
  }, [router])

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching companies:', error)
    } else {
      setCompanies(data || [])
    }
    setLoading(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-600">Loading companies...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 mb-2 tracking-tight">
              Your Companies
            </h1>
            <p className="text-zinc-600">
              Logged in as <span className="font-semibold">{user.email}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={logout}
              className="gap-2 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Companies Grid */}
        {companies.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-zinc-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden h-full">
                  <CardHeader className="p-0">
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
                      {company.banner_url ? (
                        <Image
                          src={company.banner_url}
                          alt=""
                          fill
                          className="object-cover opacity-50"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600" />
                      )}
                      <div className="absolute bottom-4 left-6 flex items-end gap-3">
                        {company.logo_url ? (
                          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white">
                            <Image
                              src={company.logo_url}
                              alt={`${company.name} logo`}
                              fill
                              className="object-contain p-1"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-white/20 border-4 border-white/40 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-white font-bold text-xl">
                              {company.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-2xl font-bold text-white drop-shadow-md">
                            {company.name}
                          </h3>
                          <code className="text-white/80 text-sm bg-white/20 px-2 py-1 rounded">
                            {company.slug}
                          </code>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-3">
                      <Button
                        asChild
                        className="w-full justify-start gap-3 h-11 rounded-xl text-sm"
                        style={{ backgroundColor: company.primary_color || '#3b82f6' }}
                      >
                        <Link href={`/${company.slug}/edit`}>
                          <Edit className="w-4 h-4" />
                          Edit Careers Page
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full justify-start gap-3 h-11 rounded-xl text-sm"
                      >
                        <Link href={`/${company.slug}/preview`} target="_blank">
                          <Eye className="w-4 h-4" />
                          Preview
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full justify-start gap-3 h-11 rounded-xl text-sm"
                      >
                        <Link href={`/${company.slug}/careers`} target="_blank">
                          <Sparkles className="w-4 h-4" />
                          View Public
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </Link>
                      </Button>
                    </div>
                    <div className="pt-4 border-t border-zinc-100">
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>Primary Color</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded border border-zinc-300"
                            style={{ backgroundColor: company.primary_color }}
                          />
                          <code>{company.primary_color}</code>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="bg-zinc-100 border-2 border-dashed border-zinc-300 rounded-2xl w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Plus className="w-12 h-12 text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-700 mb-2">No companies yet</h3>
            <p className="text-zinc-500 mb-6">Create your first company to get started.</p>
            <Button className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Create Company
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}