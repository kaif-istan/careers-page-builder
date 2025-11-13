"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mail,
  Lock,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";


// Validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  // Check if already logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Already logged in, redirect to home or redirect URL
          const redirect = searchParams.get("redirect") || "/";
          router.push(redirect);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        // Always set checkingAuth to false, regardless of session status
        setCheckingAuth(false);
      }
    }

    checkAuth();
  }, [router, searchParams]);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setSuccess(false);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      if (!authData.session) {
        toast.error("No session returned. Try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success("Welcome back!");

      // ✅ Add this to stop spinner before navigation
      setLoading(false);

      // Small delay to ensure session is persisted
      await new Promise((resolve) => setTimeout(resolve, 100));

      const redirect = searchParams.get("redirect") || "/";

      console.log("redirecting to:", redirect);

      // ✅ Force full reload to ensure Supabase session hydrates globally
      if (window.location.pathname !== redirect) {
        window.location.href = redirect;
      }
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.message || "Unexpected error");
      setLoading(false);
    }
  };

  // const handleGoogleLogin = async () => {
  //   setLoading(true);
  //   try {
  //     const redirectTo = `${window.location.origin}${
  //       searchParams.get("redirect") || "/dashboard"
  //     }`;
  //     const { error } = await supabase.auth.signInWithOAuth({
  //       provider: "google",
  //       options: {
  //         redirectTo,
  //       },
  //     });

  //     if (error) {
  //       toast.error(error.message);
  //       setLoading(false);
  //     }
  //     // OAuth will redirect, so we don't need to handle success here
  //   } catch (err: any) {
  //     toast.error(err.message || "Failed to sign in with Google");
  //     setLoading(false);
  //   }
  // };

  // Show loading spinner only during initial auth check
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-zinc-50 to-zinc-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-zinc-50 via-white to-zinc-50 p-4 relative overflow-hidden">
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
            ease: "easeInOut",
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
            ease: "easeInOut",
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
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-purple-600 shadow-lg mb-6"
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
              {/* Google OAuth Button */}
              {/* <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || success}
                className="w-full h-12 rounded-xl font-semibold text-base bg-white hover:bg-zinc-50 text-zinc-900 border-2 border-zinc-200 shadow-sm hover:shadow-md transition-all duration-200 mb-6"
              >
                {loading && !success ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        // d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button> */}

              {/* <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/80 text-zinc-500">
                    Or continue with email
                  </span>
                </div>
              </div> */}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-zinc-700 font-semibold"
                  >
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="recruiter@company.com"
                      className={`pl-10 h-12 rounded-xl border-zinc-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                        errors.email
                          ? "border-red-500 focus:ring-red-500/20"
                          : ""
                      }`}
                      {...register("email")}
                      aria-invalid={errors.email ? "true" : "false"}
                      aria-describedby={
                        errors.email ? "email-error" : undefined
                      }
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
                  <Label
                    htmlFor="password"
                    className="text-zinc-700 font-semibold"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5 pointer-events-none" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className={`pl-10 h-12 rounded-xl border-zinc-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                        errors.password
                          ? "border-red-500 focus:ring-red-500/20"
                          : ""
                      }`}
                      {...register("password")}
                      aria-invalid={errors.password ? "true" : "false"}
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
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
                      <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                      <span>{errors.root.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || success}
                  className="w-full h-12 rounded-xl font-semibold text-base bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:hover:scale-100"
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
                    "Continue"
                  )}
                </Button>
              </form>

              {/* Forgot Password Link */}
              {/* <div className="mt-6 text-center">
                <button
                  type="button"
                  className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                  onClick={() => {
                    toast("Password reset coming soon!", { icon: "🔒" });
                  }}
                >
                  Forgot your password?
                </button>
              </div> */}
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
              Trusted by{" "}
              <span className="font-semibold text-zinc-700">500+</span> growing
              companies
            </p>
            <div className="flex items-center justify-center gap-6 opacity-50">
              <div className="text-xs font-semibold text-zinc-400">Stripe</div>
              <div className="text-xs font-semibold text-zinc-400">Shopify</div>
              <div className="text-xs font-semibold text-zinc-400">Vercel</div>
              <div className="text-xs font-semibold text-zinc-400">Linear</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
