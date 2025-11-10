'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else window.location.href = '/'
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Recruiter Login</h1>
      <input placeholder="Email" type="email" className="w-full p-2 border mb-2" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" className="w-full p-2 border mb-4" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
    </div>
  )
}