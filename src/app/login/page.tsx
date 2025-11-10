'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'motion/react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Lock, Loader2, Check, AlertCircle, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'recruiter@acme.com',
      password: 'password123',
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setSuccess(false)

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        setError('root', { message: error.message })
        toast.error(error.message)
        setLoading(false)
        return
      }

      // Success!
      setSuccess(true)
      toast.success('Welcome back!')

      // Redirect after a brief delay
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setError('root', { message: err.message || 'An unexpected error occurred' })
      toast.error(err.message || 'An unexpected error occurred')
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-50 p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo & Hero Section */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg mb-6"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl font-bold text-zinc-900 mb-3 tracking-tight"
            >
              Build Your Dream Careers Page
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-zinc-600 mb-2"
            >
              Customize. Preview. Publish. In minutes.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-sm text-zinc-500"
            >
              For recruiters who want beautiful, branded career sites.
            </motion.p>
          </div>

          {/* Login Card */}
          <Card className="backdrop-blur-md bg-white/80 border-zinc-200 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-700 font-semibold">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="recruiter@company.com"
                      className={`pl-10 h-12 rounded-xl border-zinc-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                        errors.email ? 'border-red-500 focus:ring-red-500/20' : ''
                      }`}
                      {...register('email')}
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        id="email-error"
                        role="alert"
                        className="text-sm text-red-600 flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-zinc-700 font-semibold">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5 pointer-events-none" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className={`pl-10 h-12 rounded-xl border-zinc-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                        errors.password ? 'border-red-500 focus:ring-red-500/20' : ''
                      }`}
                      {...register('password')}
                      aria-invalid={errors.password ? 'true' : 'false'}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        id="password-error"
                        role="alert"
                        className="text-sm text-red-600 flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Root Error */}
                <AnimatePresence>
                  {errors.root && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      role="alert"
                      className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2"
                    >
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>{errors.root.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || success}
                  className="w-full h-12 rounded-xl font-semibold text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : success ? (
                    <>
                      <Check className="w-5 h-5" />
                      Success! Redirecting...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </form>

              {/* Forgot Password Link */}
              <div className="mt-6 text-center">
                <Link
                  href="#"
                  className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    toast('Password reset coming soon!', { icon: '🔒' })
                  }}
                >
                  Forgot your password?
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-zinc-500 mb-4">
              Trusted by <span className="font-semibold text-zinc-700">500+</span> growing companies
            </p>
            <div className="flex items-center justify-center gap-6 opacity-50">
              <div className="text-xs font-semibold text-zinc-400">Stripe</div>
              <div className="text-xs font-semibold text-zinc-400">Shopify</div>
              <div className="text-xs font-semibold text-zinc-400">Vercel</div>
              <div className="text-xs font-semibold text-zinc-400">Linear</div>
            </div>
          </motion.div>

          {/* Continue as Guest */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-6 text-center"
          >
            <Button
              variant="ghost"
              className="text-zinc-600 hover:text-zinc-900"
              onClick={() => {
                toast('Guest mode coming soon!', { icon: '👋' })
              }}
            >
              Continue as Guest
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
