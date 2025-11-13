"use client";

import { useEffect, useState, useRef } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

type PreviewData = {
  company: any;
  sections: any[];
  isPreview?: boolean;
};

export default function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastDataStrRef = useRef("");
  const savedScrollRef = useRef<number | null>(null);

  // Auth check - must be logged in to access preview page
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Please log in to view preview");
        router.push(`/login?redirect=/${slug}/preview`);
        return;
      }

      setCheckingAuth(false);

      // Load preview data after auth is verified
      loadPreview();
    }

    async function loadPreview() {
      try {
        // First try to get from localStorage (client-side)
        const previewKey = `preview_${slug}`;
        const stored = localStorage.getItem(previewKey);

        if (stored) {
          const previewData = JSON.parse(stored);
          setData({
            company: previewData.company,
            sections: previewData.sections,
            isPreview: true,
          });
          setLoading(false);
          return;
        }

        // Fallback to API route (which will use cookies or DB)
        const response = await fetch(`/api/preview?slug=${slug}`);
        if (!response.ok) {
          throw new Error("Failed to load preview");
        }

        const apiData = await response.json();
        setData(apiData);
      } catch (err: any) {
        setError(err.message || "Failed to load preview");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    // Listen for custom preview-updated event (same-tab updates)
    const handlePreviewUpdate = (e: CustomEvent) => {
      if (e.detail?.slug === slug && e.detail?.data) {
        // Save current scroll position
        savedScrollRef.current = window.scrollY || window.pageYOffset || 0;

        setData({
          company: e.detail.data.company,
          sections: e.detail.data.sections,
          isPreview: true,
        });
      }
    };

    // Listen for postMessage from parent window (iframe communication)
    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (
        e.data?.type === "preview-update" &&
        e.data?.slug === slug &&
        e.data?.data
      ) {
        // Save current scroll position
        savedScrollRef.current = window.scrollY || window.pageYOffset || 0;

        setData({
          company: e.data.data.company,
          sections: e.data.data.sections,
          isPreview: true,
        });
      }
    };

    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `preview_${slug}` && e.newValue) {
        try {
          const previewData = JSON.parse(e.newValue);
          setData({
            company: previewData.company,
            sections: previewData.sections,
            isPreview: true,
          });
        } catch (error) {
          console.error("Failed to parse storage update:", error);
        }
      }
    };

    window.addEventListener(
      "preview-updated",
      handlePreviewUpdate as EventListener
    );
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("message", handleMessage);

    // Also poll for changes (backup mechanism)
    const interval = setInterval(() => {
      const stored = localStorage.getItem(`preview_${slug}`);
      if (stored) {
        try {
          const previewData = JSON.parse(stored);
          const newDataStr = JSON.stringify({
            company: previewData.company,
            sections: previewData.sections,
          });
          // Only update if data actually changed
          if (newDataStr !== lastDataStrRef.current) {
            lastDataStrRef.current = newDataStr;
            // Save current scroll position
            savedScrollRef.current = window.scrollY || window.pageYOffset || 0;

            setData({
              company: previewData.company,
              sections: previewData.sections,
              isPreview: true,
            });
          }
        } catch (error) {
          // Ignore parse errors
        }
      }
    }, 500);

    return () => {
      window.removeEventListener(
        "preview-updated",
        handlePreviewUpdate as EventListener
      );
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("message", handleMessage);
      clearInterval(interval);
    };
  }, [slug]);

  // Restore scroll position after data updates
  useEffect(() => {
    if (savedScrollRef.current !== null && data) {
      // Use multiple requestAnimationFrame calls to ensure DOM is fully updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (savedScrollRef.current !== null) {
            window.scrollTo(0, savedScrollRef.current);
            savedScrollRef.current = null;
          }
        });
      });
    }
  }, [data]);

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-600">
            {checkingAuth ? "Checking authentication..." : "Loading preview..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error: {error || "Failed to load preview"}
          </p>
          <Link
            href={`/${slug}/edit`}
            className="text-blue-600 hover:underline"
          >
            Go back to editor
          </Link>
        </div>
      </div>
    );
  }

  const { company, sections } = data;

  return (
    <div className="min-h-screen bg-white">
      {/* Preview Badge */}
      {data.isPreview && (
        <div className="bg-amber-500 text-white text-center py-2 text-sm font-medium">
          🔍 Preview Mode — These are unsaved changes
        </div>
      )}

      {/* Hero Section */}
      <div
        className="relative h-[700px] bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 overflow-hidden"
        style={{
          backgroundImage: company.banner_url
            ? `url(${company.banner_url})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-black/70" />

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 h-full flex items-center">
          <div className="max-w-3xl">
            {company.logo_url ? (
              <div className="mb-8">
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl backdrop-blur-sm bg-white/10">
                  <Image
                    src={company.logo_url}
                    alt={`${company.name} logo`}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                    priority
                    unoptimized
                  />
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <div className="w-32 h-32 rounded-2xl border-4 border-white/20 shadow-2xl backdrop-blur-sm bg-white/10 flex items-center justify-center">
                  <span className="text-white/60 text-sm font-medium">
                    No Logo
                  </span>
                </div>
              </div>
            )}
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
              {company.name} Careers
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Join our growing team
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Culture Video */}
      {company.culture_video_url && (
        <div className="max-w-6xl mx-auto px-6 mt-20">
          <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-zinc-200">
            <iframe
              src={
                company.culture_video_url
                  .replace("watch?v=", "embed/")
                  .split("&")[0]
              }
              className="w-full h-full"
              allowFullScreen
              title="Company Culture"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-6 py-20 space-y-20">
        {sections && sections.length > 0 ? (
          sections.map((s: any, index: number) => (
            <section
              key={s.id}
              className={`flex flex-col gap-8 ${
                index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
              } items-center`}
            >
              <div className="flex-1 space-y-4">
                <h2 className="text-4xl font-bold text-zinc-900 tracking-tight">
                  {s.title}
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg text-zinc-600 leading-relaxed whitespace-pre-wrap">
                    {s.content}
                  </p>
                </div>
              </div>
              {s.image_url && (
                <div className="flex-1 w-full">
                  <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video">
                    <Image
                      src={s.image_url}
                      alt={s.title}
                      fill
                      className="object-cover"
                      loading="lazy"
                      unoptimized
                    />
                  </div>
                </div>
              )}
            </section>
          ))
        ) : (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-lg">
              No content sections yet. Add some in the editor!
            </p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-linear-to-br from-zinc-50 to-zinc-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            Ready to join us?
          </h2>
          <p className="text-xl text-zinc-600 mb-8">
            Explore our open positions and find your next opportunity
          </p>
          <Link
            href={`/${slug}/careers`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg text-white"
            style={{ backgroundColor: company.primary_color || "#3b82f6" }}
          >
            View Open Roles
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
