// src/app/[slug]/edit/page.tsx
"use client";

import { supabase } from "@/lib/supabase";
import { Company, Section } from "@/types";
import { useEffect, useState, use, useCallback, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GripVertical, Trash2, Plus, Eye, Check, Loader2, ExternalLink, Copy, Save, X } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useDebouncedCallback } from "use-debounce";


const brandSchema = z.object({
  logo_url: z.string().url().or(z.literal("")),
  banner_url: z.string().url().or(z.literal("")),
  primary_color: z.string().regex(/^#/),
  culture_video_url: z.string().url().or(z.literal("")),
});

type BrandForm = z.infer<typeof brandSchema>;

type PreviewData = {
  company: Partial<Company>;
  sections: Section[];
};

// Helper functions for localStorage
const getPreviewKey = (slug: string) => `preview_${slug}`;

const savePreviewToStorage = (slug: string, data: PreviewData) => {
  try {
    localStorage.setItem(getPreviewKey(slug), JSON.stringify(data));
    // Also set cookie for API route access
    document.cookie = `preview_${slug}=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=86400; SameSite=Lax`;
  } catch (error) {
    console.error("Failed to save preview:", error);
  }
};

const loadPreviewFromStorage = (slug: string): PreviewData | null => {
  try {
    const stored = localStorage.getItem(getPreviewKey(slug));
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to load preview:", error);
    return null;
  }
};

const clearPreviewStorage = (slug: string) => {
  try {
    localStorage.removeItem(getPreviewKey(slug));
    document.cookie = `preview_${slug}=; path=/; max-age=0`;
  } catch (error) {
    console.error("Failed to clear preview:", error);
  }
};

export default function EditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  
  // Published data (from Supabase)
  const [publishedCompany, setPublishedCompany] = useState<Company | null>(null);
  const [publishedSections, setPublishedSections] = useState<Section[]>([]);
  
  // Preview data (local state - unsaved changes)
  const [previewCompany, setPreviewCompany] = useState<Partial<Company> | null>(null);
  const [previewSections, setPreviewSections] = useState<Section[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("brand");

  const { register, handleSubmit, reset, watch, setValue } = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      logo_url: "",
      banner_url: "",
      primary_color: "#3b82f6",
      culture_video_url: "",
    },
  });


  // useEffect(() => {
  //   let mounted = true;
    
  //   // Listen to auth state changes
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  //     console.log('Auth state changed:', event, session);
      
  //     if (!mounted) return;
      
  //     if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
  //       if (session) {
  //         setCheckingAuth(false);
  //         loadData();
  //       } else {
  //         toast.error('Please log in to continue');
  //         router.push(`/login?redirect=/${slug}/edit`);
  //       }
  //     } else if (event === 'SIGNED_OUT') {
  //       toast.error('Please log in to continue');
  //       router.push(`/login?redirect=/${slug}/edit`);
  //     }
  //   });
    
  //   async function loadData() {
  //     if (!mounted) return;
      
  //     const { data: comp, error } = await supabase
  //       .from("companies")
  //       .select("*")
  //       .eq("slug", slug)
  //       .single();
  
  //     if (!mounted) return;
  
  //     if (error || !comp) {
  //       toast.error("Company not found");
  //       notFound();
  //       return;
  //     }
  
  //     const { data: secs } = await supabase
  //       .from("company_sections")
  //       .select("*")
  //       .eq("company_id", comp.id)
  //       .order("order_index");
  
  //     if (!mounted) return;
  
  //     setPublishedCompany(comp);
  //     setPublishedSections(secs || []);
  
  //     // Check for existing preview data
  //     const existingPreview = loadPreviewFromStorage(slug);
  //     if (existingPreview) {
  //       const previewComp = { ...comp, ...existingPreview.company };
  //       const previewSecs = existingPreview.sections;
  //       previewCompanyRef.current = previewComp;
  //       previewSectionsRef.current = previewSecs;
  //       setPreviewCompany(previewComp);
  //       setPreviewSections(previewSecs);
  //       setHasUnsavedChanges(true);
        
  //       reset({
  //         logo_url: existingPreview.company.logo_url || comp.logo_url || "",
  //         banner_url: existingPreview.company.banner_url || comp.banner_url || "",
  //         primary_color: existingPreview.company.primary_color || comp.primary_color,
  //         culture_video_url: existingPreview.company.culture_video_url || comp.culture_video_url || "",
  //       });
  //     } else {
  //       previewCompanyRef.current = comp;
  //       previewSectionsRef.current = secs || [];
  //       setPreviewCompany(comp);
  //       setPreviewSections(secs || []);
        
  //       reset({
  //         logo_url: comp.logo_url || "",
  //         banner_url: comp.banner_url || "",
  //         primary_color: comp.primary_color,
  //         culture_video_url: comp.culture_video_url || "",
  //       });
  //     }
  
  //     setLoading(false);
  //   }
    
  //   return () => {
  //     mounted = false;
  //     subscription.unsubscribe();
  //   };
  // }, [router, slug, reset]);

  useEffect(() => {
    let mounted = true;
  
    // ✅ Define the data-loading function first so it's in scope
    async function loadData() {
      if (!mounted) return;
  
      const { data: comp, error } = await supabase
        .from("companies")
        .select("*")
        .eq("slug", slug)
        .single();
  
      if (!mounted) return;
  
      if (error || !comp) {
        toast.error("Company not found");
        notFound();
        return;
      }
  
      const { data: secs } = await supabase
        .from("company_sections")
        .select("*")
        .eq("company_id", comp.id)
        .order("order_index");
  
      if (!mounted) return;
  
      setPublishedCompany(comp);
      setPublishedSections(secs || []);
  
      // Check for existing preview data in localStorage
      const existingPreview = loadPreviewFromStorage(slug);
      if (existingPreview) {
        const previewComp = { ...comp, ...existingPreview.company };
        const previewSecs = existingPreview.sections;
        previewCompanyRef.current = previewComp;
        previewSectionsRef.current = previewSecs;
        setPreviewCompany(previewComp);
        setPreviewSections(previewSecs);
        setHasUnsavedChanges(true);
  
        reset({
          logo_url: existingPreview.company.logo_url || comp.logo_url || "",
          banner_url: existingPreview.company.banner_url || comp.banner_url || "",
          primary_color: existingPreview.company.primary_color || comp.primary_color,
          culture_video_url: existingPreview.company.culture_video_url || comp.culture_video_url || "",
        });
      } else {
        previewCompanyRef.current = comp;
        previewSectionsRef.current = secs || [];
        setPreviewCompany(comp);
        setPreviewSections(secs || []);
  
        reset({
          logo_url: comp.logo_url || "",
          banner_url: comp.banner_url || "",
          primary_color: comp.primary_color,
          culture_video_url: comp.culture_video_url || "",
        });
      }
  
      setLoading(false);
    }
  
    // ✅ Step 1: Check current session first
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();


  
      if (!mounted) return;
  
      if (!session) {
        toast.error('Please log in to continue');
        router.push(`/login?redirect=/${slug}/edit`);
        return;
      }
  
      setCheckingAuth(false);
      await loadData();
    }
  
    checkSession();
  
    // ✅ Step 2: Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
  
      if (event === 'SIGNED_IN' && session) {
        setCheckingAuth(false);
        loadData();
      }
  
      if (event === 'SIGNED_OUT') {
        toast.error('Please log in to continue');
        router.push(`/login?redirect=/${slug}/edit`);
      }
    });
  
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, slug, reset]);
  
  const watchedValues = watch();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Use refs to always get latest values
  const previewCompanyRef = useRef(previewCompany);
  const previewSectionsRef = useRef(previewSections);
  const publishedCompanyRef = useRef(publishedCompany);
  
  useEffect(() => {
    previewCompanyRef.current = previewCompany;
  }, [previewCompany]);
  
  useEffect(() => {
    previewSectionsRef.current = previewSections;
  }, [previewSections]);

  useEffect(() => {
    publishedCompanyRef.current = publishedCompany;
  }, [publishedCompany]);

  // Update preview storage function - uses refs to avoid stale closures
  const updatePreviewStorage = useCallback(() => {
    const currentCompany = previewCompanyRef.current;
    const currentSections = previewSectionsRef.current;
    const currentPublished = publishedCompanyRef.current;
    
    if (!currentCompany || !currentPublished) return;
    
    const previewData: PreviewData = {
      company: currentCompany,
      sections: currentSections,
    };
    
    savePreviewToStorage(slug, previewData);
    setHasUnsavedChanges(true);
    
    // Trigger custom event for same-tab updates (storage event only fires cross-tab)
    // The preview page listens for this event and updates without reloading
    window.dispatchEvent(new CustomEvent('preview-updated', {
      detail: { slug, data: previewData }
    }));
    
    // Also send message to iframe if it exists (for cross-frame communication)
    const iframe = document.querySelector(`iframe[title="Live Preview"]`) as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage({
          type: 'preview-update',
          slug,
          data: previewData
        }, window.location.origin);
      } catch (e) {
        // Cross-origin or other error, ignore
      }
    }
  }, [slug]);

  // Debounced version for form changes
  const debouncedUpdatePreview = useDebouncedCallback(updatePreviewStorage, 300);

  // Update preview when form values change
  useEffect(() => {
    if (!previewCompany || !publishedCompany) return;
    
    const updatedCompany = {
      ...previewCompany,
      logo_url: watchedValues.logo_url,
      banner_url: watchedValues.banner_url,
      primary_color: watchedValues.primary_color,
      culture_video_url: watchedValues.culture_video_url,
    };
    
    // Only update if something actually changed
    const hasChanged = 
      updatedCompany.logo_url !== previewCompany.logo_url ||
      updatedCompany.banner_url !== previewCompany.banner_url ||
      updatedCompany.primary_color !== previewCompany.primary_color ||
      updatedCompany.culture_video_url !== previewCompany.culture_video_url;
    
    if (!hasChanged) return;
    
    // Update refs immediately so updatePreviewStorage has latest values
    previewCompanyRef.current = updatedCompany;
    setPreviewCompany(updatedCompany);
    // Use debounced update for form changes
    debouncedUpdatePreview();
  }, [watchedValues.logo_url, watchedValues.banner_url, watchedValues.primary_color, watchedValues.culture_video_url]);

  // Track sections serialization to detect changes
  const sectionsSerializedRef = useRef<string>('');
  
  useEffect(() => {
    if (!previewCompany || !publishedCompany) return;
    
    const currentSerialized = JSON.stringify(previewSections);
    // Only update if sections actually changed
    if (currentSerialized === sectionsSerializedRef.current) return;
    
    sectionsSerializedRef.current = currentSerialized;
    // Use a small delay to ensure state has settled, then update preview
    const timer = setTimeout(() => {
      updatePreviewStorage();
    }, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewSections]);

  // Handle brand form submission (just updates preview, doesn't publish)
  const onSubmitBrand = async (data: BrandForm) => {
    if (!previewCompany) return;
    
    const updatedCompany = {
      ...previewCompany,
      ...data,
    };
    
    setPreviewCompany(updatedCompany);
    toast.success("Preview updated!");
  };

  // PUBLISH - Save to Supabase
  const handlePublish = async () => {
    if (!previewCompany || !publishedCompany) return;
    
    setPublishing(true);

    try {
      // Update company
      const companyChanges: Partial<Company> = {};
      if (previewCompany.logo_url !== publishedCompany.logo_url) {
        companyChanges.logo_url = previewCompany.logo_url || null;
      }
      if (previewCompany.banner_url !== publishedCompany.banner_url) {
        companyChanges.banner_url = previewCompany.banner_url || null;
      }
      if (previewCompany.primary_color !== publishedCompany.primary_color) {
        companyChanges.primary_color = previewCompany.primary_color;
      }
      if (previewCompany.culture_video_url !== publishedCompany.culture_video_url) {
        companyChanges.culture_video_url = previewCompany.culture_video_url || null;
      }

      if (Object.keys(companyChanges).length > 0) {
        const { error: companyError } = await supabase
          .from("companies")
          .update(companyChanges)
          .eq("id", publishedCompany.id);

        if (companyError) throw companyError;
      }

      // Update sections
      // Delete removed sections
      const previewSectionIds = new Set(previewSections.map(s => s.id));
      const sectionsToDelete = publishedSections.filter(s => !previewSectionIds.has(s.id));
      
      for (const section of sectionsToDelete) {
        await supabase.from("company_sections").delete().eq("id", section.id);
      }

      // Upsert all preview sections
      const sectionUpdates = previewSections.map((s, index) => ({
        id: s.id,
        company_id: publishedCompany.id,
        type: s.type,
        title: s.title,
        content: s.content,
        image_url: s.image_url || null,
        order_index: index,
      }));

      if (sectionUpdates.length > 0) {
        const { error: sectionsError } = await supabase
          .from("company_sections")
          .upsert(sectionUpdates);

        if (sectionsError) throw sectionsError;
      }

      // Update published state
      setPublishedCompany({ ...publishedCompany, ...companyChanges });
      setPublishedSections([...previewSections]);
      
      // Clear preview storage
      clearPreviewStorage(slug);
      setHasUnsavedChanges(false);
      
      toast.success("Published successfully! 🎉");
      
      // Refresh the page to show published data
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error: any) {
      toast.error(`Failed to publish: ${error.message}`);
    } finally {
      setPublishing(false);
    }
  };

  // DISCARD - Clear preview and revert to published
  const handleDiscard = () => {
    if (!publishedCompany) return;
    
    if (confirm("Are you sure you want to discard all unsaved changes?")) {
      clearPreviewStorage(slug);
      setPreviewCompany(publishedCompany);
      setPreviewSections(publishedSections);
      setHasUnsavedChanges(false);
      
      reset({
        logo_url: publishedCompany.logo_url || "",
        banner_url: publishedCompany.banner_url || "",
        primary_color: publishedCompany.primary_color,
        culture_video_url: publishedCompany.culture_video_url || "",
      });
      
      toast.success("Changes discarded");
    }
  };

  // Drag & Drop
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = previewSections.findIndex((s) => s.id === active.id);
    const newIdx = previewSections.findIndex((s) => s.id === over.id);
    const newSections = arrayMove(previewSections, oldIdx, newIdx);

    previewSectionsRef.current = newSections;
    setPreviewSections(newSections);
    toast.success("Sections reordered");
  };

  // ADD SECTION
  const addSection = () => {
    if (!previewCompany) {
      toast.error("Company not loaded");
      return;
    }

    const newSec: Section = {
      id: crypto.randomUUID(),
      company_id: previewCompany.id!,
      type: "about",
      title: "New Section",
      content: "Edit this content...",
      image_url: null,
      order_index: previewSections.length,
    };

    const updated = [...previewSections, newSec];
    previewSectionsRef.current = updated;
    setPreviewSections(updated);
    toast.success("Section added");
  };

  // DELETE SECTION
  const deleteSection = (id: string) => {
    const updated = previewSections.filter((s) => s.id !== id);
    previewSectionsRef.current = updated;
    setPreviewSections(updated);
    toast.success("Section deleted");
  };

  // UPDATE SECTION
  const updateSection = (id: string, field: keyof Section, value: string) => {
    const updated = previewSections.map((s) =>
      s.id === id ? { ...s, [field]: value } : s
    );
    // Update ref immediately
    previewSectionsRef.current = updated;
    setPreviewSections(updated);
    // Trigger immediate update for section content changes
    setTimeout(() => updatePreviewStorage(), 100);
  };

  const copyPreviewLink = () => {
    const url = `${window.location.origin}/${slug}/preview`;
    navigator.clipboard.writeText(url);
    toast.success("Preview link copied!");
  };

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-600">
            {checkingAuth ? 'Checking authentication...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!previewCompany || !publishedCompany) return null;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 shadow-sm">
        <div className="max-w-full mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {previewCompany.name} — Editor
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {hasUnsavedChanges ? (
                <span className="text-amber-600 font-medium">● Unsaved changes</span>
              ) : (
                "All changes published"
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <Button
                variant="outline"
                onClick={handleDiscard}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
                Discard
              </Button>
            )}
            <Button
              variant="outline"
              onClick={copyPreviewLink}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Preview Link
            </Button>
            <Button
              onClick={handlePublish}
              disabled={!hasUnsavedChanges || publishing}
              className="gap-2"
              style={{
                backgroundColor: hasUnsavedChanges ? (previewCompany.primary_color || "#3b82f6") : undefined,
              }}
            >
              {publishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Publish Changes
                </>
              )}
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href={`/${slug}/preview`} target="_blank">
                <Eye className="w-4 h-4" />
                Preview
                <ExternalLink className="w-3 h-3" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Split Screen Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Editor */}
        <div className="w-full lg:w-1/2 border-r border-zinc-200 overflow-y-auto bg-white">
          <div className="max-w-2xl mx-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="brand">Brand</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>

              {/* BRAND TAB */}
              <TabsContent value="brand" className="space-y-6">
                <Card className="border-zinc-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Brand Settings</CardTitle>
                    <p className="text-sm text-zinc-500 mt-1">
                      Customize your company's visual identity
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleSubmit(onSubmitBrand)}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-900">
                          Logo URL
                        </label>
                        <Input
                          {...register("logo_url")}
                          placeholder="https://example.com/logo.png"
                          className="rounded-xl"
                        />
                        <p className="text-xs text-zinc-500">
                          Upload your logo to a CDN or image hosting service
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-900">
                          Banner URL
                        </label>
                        <Input
                          {...register("banner_url")}
                          placeholder="https://example.com/banner.jpg"
                          className="rounded-xl"
                        />
                        <p className="text-xs text-zinc-500">
                          Hero banner image (recommended: 1920x600px)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-900">
                          Primary Color
                        </label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="color"
                            {...register("primary_color")}
                            className="w-20 h-12 rounded-xl cursor-pointer border-zinc-200"
                          />
                          <Input
                            {...register("primary_color")}
                            placeholder="#3b82f6"
                            className="flex-1 rounded-xl"
                          />
                        </div>
                        <p className="text-xs text-zinc-500">
                          Used for buttons and accents
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-900">
                          Culture Video (YouTube)
                        </label>
                        <Input
                          {...register("culture_video_url")}
                          placeholder="https://youtube.com/watch?v=..."
                          className="rounded-xl"
                        />
                        <p className="text-xs text-zinc-500">
                          YouTube video URL showcasing your company culture
                        </p>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* CONTENT TAB */}
              <TabsContent value="content" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-900">
                      Content Sections
                    </h2>
                    <p className="text-sm text-zinc-500 mt-0.5">
                      Drag to reorder sections
                    </p>
                  </div>
                  <Button
                    onClick={addSection}
                    size="sm"
                    className="rounded-xl gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Section
                  </Button>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={previewSections.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      <AnimatePresence>
                        {previewSections.map((section) => (
                          <SortableSection
                            key={section.id}
                            section={section}
                            onUpdate={updateSection}
                            onDelete={deleteSection}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </SortableContext>
                </DndContext>

                {previewSections.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-2xl">
                    <p className="text-zinc-500 mb-4">No sections yet</p>
                    <Button onClick={addSection} variant="outline" className="rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Section
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Side - Live Preview */}
        <div className="hidden lg:block w-1/2 bg-zinc-100 overflow-y-auto">
          <div className="sticky top-0 bg-zinc-50 border-b border-zinc-200 px-6 py-3 z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-700">Live Preview</h3>
              <span className="text-xs text-zinc-500">Updates as you type</span>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-200">
              <iframe
                src={`/${slug}/preview`}
                className="w-full h-[calc(100vh-150px)] border-0"
                title="Live Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced SortableSection
function SortableSection({
  section,
  onUpdate,
  onDelete,
}: {
  section: Section;
  onUpdate: (id: string, field: keyof Section, value: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className="border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <GripVertical className="w-5 h-5" />
            </div>
            <Select
              defaultValue={section.type}
              onValueChange={(v) => onUpdate(section.id, "type", v)}
            >
              <SelectTrigger className="w-48 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="about">About Us</SelectItem>
                <SelectItem value="culture">Life at Company</SelectItem>
                <SelectItem value="values">Our Values</SelectItem>
                <SelectItem value="benefits">Benefits</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(section.id)}
              className="ml-auto rounded-xl hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <Input
            placeholder="Section Title"
            defaultValue={section.title}
            onChange={(e) => onUpdate(section.id, "title", e.target.value)}
            className="mb-3 rounded-xl font-semibold"
          />
          <Textarea
            placeholder="Section content... (supports line breaks)"
            defaultValue={section.content}
            onChange={(e) => onUpdate(section.id, "content", e.target.value)}
            rows={5}
            className="mb-3 rounded-xl resize-none"
          />
          <Input
            placeholder="Image URL (optional)"
            defaultValue={section.image_url || ""}
            onChange={(e) => onUpdate(section.id, "image_url", e.target.value)}
            className="rounded-xl"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
