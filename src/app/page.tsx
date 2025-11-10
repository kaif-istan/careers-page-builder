// src/app/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10))


export default function Home() {
  const [email, setEmail] = useState('recruiter@acme.com')
  const [password, setPassword] = useState('password123')
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    console.log('Supabase login response:', { data, error })
    if (error){
      console.error(error)
      return alert(error.message)
    }
    setUser(data.user)

    // Fetch company
    const { data: comp } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', 'acme')
      .single()

    setCompany(comp)
  }

  const logout = () => supabase.auth.signOut()

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Careers Page Builder</h1>

      {!user ? (
        <div className="space-y-4">
          <input
            className="w-full p-3 border rounded"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="w-full p-3 border rounded"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            onClick={login}
            className="w-full bg-blue-600 text-white p-3 rounded font-medium"
          >
            Login
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p>Logged in as: <strong>{user.email}</strong></p>
            <button onClick={logout} className="text-red-600">Logout</button>
          </div>

          {company ? (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold">{company.name}</h2>
              <p>Slug: <code>{company.slug}</code></p>
              <p>Color: <span style={{ color: company.primary_color }}>■■■</span> {company.primary_color}</p>
              <a href={`/${company.slug}/edit`} className="text-blue-600 underline">
                → Go to Edit Page
              </a>
            </div>
          ) : (
            <p>Loading company...</p>
          )}
        </div>
      )}
    </div>
  )
}