// src/app/[slug]/edit/page.tsx
"use client";

import { supabase } from "@/lib/supabase";
import { Company, Section } from "@/types";
import { useEffect, useState, use } from "react";
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
import { GripVertical, Trash2, Plus, Eye } from "lucide-react";
import { notFound } from "next/navigation";
import toast from "react-hot-toast";

const brandSchema = z.object({
  logo_url: z.string().url().or(z.literal("")),
  banner_url: z.string().url().or(z.literal("")),
  primary_color: z.string().regex(/^#/),
  culture_video_url: z.string().url().or(z.literal("")),
});

type BrandForm = z.infer<typeof brandSchema>;

export default function EditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [company, setCompany] = useState<Company | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      logo_url: "",
      banner_url: "",
      primary_color: "#3b82f6",
      culture_video_url: "",
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load company + sections
  useEffect(() => {
    async function load() {
      const { data: comp, error } = await supabase
        .from("companies")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error || !comp) {
        toast.error("Company not found");
        notFound();
      }

      const { data: secs } = await supabase
        .from("company_sections")
        .select("*")
        .eq("company_id", comp.id)
        .order("order_index")
        .select();

      setCompany(comp);
      setSections(secs || []);

      reset({
        logo_url: comp.logo_url || "",
        banner_url: comp.banner_url || "",
        primary_color: comp.primary_color,
        culture_video_url: comp.culture_video_url || "",
      });

      setLoading(false);
    }
    load();
  }, [slug, reset]);

  // SAVE BRAND
  const onSubmitBrand = async (data: BrandForm) => {
    if (!company) return;
    setSaving(true);

    console.log("Current company:", company);
    console.log("Form data:", data);
    console.log(slug)

    // COMPARE: Only send fields that changed
    const changes: Partial<Company> = {};
    if (data.logo_url !== company.logo_url) changes.logo_url = data.logo_url;
    if (data.banner_url !== company.banner_url)
      changes.banner_url = data.banner_url;
    if (data.primary_color !== company.primary_color)
      changes.primary_color = data.primary_color;
    if (data.culture_video_url !== company.culture_video_url)
      changes.culture_video_url = data.culture_video_url;

    // If no changes → show toast and exit
    if (Object.keys(changes).length === 0) {
      setSaving(false);
      toast.success("No changes to save");
      return;
    }

    console.log("Sending changes:", changes);


    const { data: updated, error } = await supabase
      .from("companies")
      .update(changes)
      .eq("id", company.id)
      .select()

    console.log("Update result:", { updated });

    setSaving(false);

    if (error) {
      toast.error(`Failed: ${error.message}`);
    } else if (updated && updated.length > 0) {
      toast.success("Brand updated!");
      // Update local state
      setCompany({ ...company, ...changes });
    } else {
      toast.error("Update failed (no rows matched)");
    }
  };

  // Drag & Drop
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = sections.findIndex((s) => s.id === active.id);
    const newIdx = sections.findIndex((s) => s.id === over.id);
    const newSections = arrayMove(sections, oldIdx, newIdx);

    const updates = newSections.map((s, i) => ({ id: s.id, order_index: i }));
    const { error } = await supabase.from("company_sections").upsert(updates);

    if (!error) {
      setSections(newSections);
      toast.success("Sections reordered");
    } else {
      toast.error("Failed to reorder");
    }
  };

  // ADD SECTION — FIXED: Only if company exists
  const addSection = async () => {
    if (!company) {
      toast.error("Company not loaded");
      return;
    }

    const newSec: Partial<Section> = {
      company_id: company.id, // ← SAFE: company is not null
      type: "about",
      title: "New Section",
      content: "Edit this content...",
      order_index: sections.length,
    };

    const { data, error } = await supabase
      .from("company_sections")
      .insert(newSec)
      .select()
      .single();

    if (data) {
      setSections([...sections, data]);
      toast.success("Section added");
    } else {
      toast.error("Failed to add section");
    }
  };

  // DELETE SECTION
  const deleteSection = async (id: string) => {
    const { error } = await supabase
      .from("company_sections")
      .delete()
      .eq("id", id);
    if (!error) {
      setSections(sections.filter((s) => s.id !== id));
      toast.success("Section deleted");
    } else {
      toast.error("Failed to delete");
    }
  };

  // UPDATE SECTION
  const updateSection = async (
    id: string,
    field: keyof Section,
    value: string
  ) => {
    const { error } = await supabase
      .from("company_sections")
      .update({ [field]: value })
      .eq("id", id);
    if (error) toast.error("Failed to update");
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {company?.name} — Careers Editor
          </h1>
          <Button asChild>
            <a href={`/${slug}/preview`} className="flex items-center gap-2">
              <Eye className="w-4 h-4" /> Preview
            </a>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="brand" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="brand">Brand</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          {/* BRAND TAB */}
          <TabsContent value="brand" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {/* BRAND TAB */}
                <TabsContent value="brand" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Brand Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={handleSubmit(onSubmitBrand)}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Logo URL
                          </label>
                          <Input
                            {...register("logo_url")}
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Banner URL
                          </label>
                          <Input
                            {...register("banner_url")}
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Primary Color
                          </label>
                          <Input
                            type="color"
                            {...register("primary_color")}
                            className="w-full h-10"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Culture Video (YouTube)
                          </label>
                          <Input
                            {...register("culture_video_url")}
                            placeholder="https://youtube.com/watch?v=..."
                          />
                        </div>
                        <div className="pt-4">
                          <Button
                            type="submit"
                            disabled={saving}
                            className="w-full"
                          >
                            {saving ? "Saving..." : "Update Brand"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTENT TAB */}
          <TabsContent value="content" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Content Sections</h2>
              <Button onClick={addSection} size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Section
              </Button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {sections.map((section) => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      onUpdate={updateSection}
                      onDelete={deleteSection}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// SortableSection (unchanged)
function SortableSection({
  section,
  onUpdate,
  onDelete,
}: {
  section: Section;
  onUpdate: any;
  onDelete: any;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <Card ref={setNodeRef} style={style} className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        <Select
          defaultValue={section.type}
          onValueChange={(v) => onUpdate(section.id, "type", v)}
        >
          <SelectTrigger className="w-48">
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
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <Input
        placeholder="Title"
        defaultValue={section.title}
        onChange={(e) => onUpdate(section.id, "title", e.target.value)}
        className="mb-2"
      />
      <Textarea
        placeholder="Content"
        defaultValue={section.content}
        onChange={(e) => onUpdate(section.id, "content", e.target.value)}
        rows={4}
        className="mb-2"
      />
      <Input
        placeholder="Image URL"
        defaultValue={section.image_url || ""}
        onChange={(e) => onUpdate(section.id, "image_url", e.target.value)}
      />
    </Card>
  );
}
