// src/app/[slug]/edit/page.tsx
'use client'

import { supabase } from '@/lib/supabase'
import { Company, Section } from '@/types'
import { useEffect, useState, use } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import debounce from 'debounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GripVertical, Trash2, Plus, Eye } from 'lucide-react'

const brandSchema = z.object({
  logo_url: z.string().url().or(z.literal('')),
  banner_url: z.string().url().or(z.literal('')),
  primary_color: z.string().regex(/^#/),
  culture_video_url: z.string().url().or(z.literal('')),
})

type BrandForm = z.infer<typeof brandSchema>

export default function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  // UNWRAP THE PROMISE USING `use`
  const { slug } = use(params)

  const [company, setCompany] = useState<Company | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const { register, watch, setValue } = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      logo_url: '',
      banner_url: '',
      primary_color: '#3b82f6',
      culture_video_url: '',
    }
  })

  // Load data
  useEffect(() => {
    async function load() {
      const { data: comp } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', slug)
        .single()

      const { data: secs } = await supabase
        .from('company_sections')
        .select('*')
        .eq('company_id', comp.id)
        .order('order_index')

      setCompany(comp)
      setSections(secs || [])
      
      setValue('logo_url', comp.logo_url || '')
      setValue('banner_url', comp.banner_url || '')
      setValue('primary_color', comp.primary_color)
      setValue('culture_video_url', comp.culture_video_url || '')

      setLoading(false)
    }
    load()
  }, [slug, setValue])

  // Auto-save brand
  const watched = watch()
  useEffect(() => {
    if (!company || loading) return
    const save = debounce(async () => {
      await supabase.from('companies').update(watched).eq('id', company.id)
    }, 800)
    save()
  }, [watched, company, loading])

  // Drag & Drop
  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = sections.findIndex(s => s.id === active.id)
    const newIdx = sections.findIndex(s => s.id === over.id)
    const newSections = arrayMove(sections, oldIdx, newIdx)

    const updates = newSections.map((s, i) => ({ id: s.id, order_index: i }))
    await supabase.from('company_sections').upsert(updates)
    setSections(newSections)
  }

  const addSection = async () => {
    const newSec: Partial<Section> = {
      company_id: company!.id,
      type: 'about',
      title: 'New Section',
      content: 'Edit this content...',
      order_index: sections.length
    }
    const { data } = await supabase.from('company_sections').insert(newSec).select().single()
    setSections([...sections, data])
  }

  const deleteSection = async (id: string) => {
    await supabase.from('company_sections').delete().eq('id', id)
    setSections(sections.filter(s => s.id !== id))
  }

  const updateSection = debounce(async (id: string, field: keyof Section, value: string) => {
    await supabase.from('company_sections').update({ [field]: value }).eq('id', id)
  }, 600)

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{company?.name} — Careers Editor</h1>
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

          <TabsContent value="brand" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Logo URL</label>
                  <Input {...register('logo_url')} placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Banner URL</label>
                  <Input {...register('banner_url')} placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Primary Color</label>
                  <Input type="color" {...register('primary_color')} className="w-full h-10" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Culture Video (YouTube)</label>
                  <Input {...register('culture_video_url')} placeholder="https://youtube.com/watch?v=..." />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Content Sections</h2>
              <Button onClick={addSection} size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Section
              </Button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
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
  )
}

// Draggable Section Component
function SortableSection({ section, onUpdate, onDelete }: { section: Section; onUpdate: any; onDelete: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <Card ref={setNodeRef} style={style} className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <div {...attributes} {...listeners} className="cursor-grab text-gray-400">
          <GripVertical className="w-5 h-5" />
        </div>
        <Select
          defaultValue={section.type}
          onValueChange={(v) => onUpdate(section.id, 'type', v)}
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
        <Button variant="ghost" size="icon" onClick={() => onDelete(section.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <Input
        placeholder="Section Title"
        defaultValue={section.title}
        onChange={(e) => onUpdate(section.id, 'title', e.target.value)}
        className="mb-2"
      />
      <Textarea
        placeholder="Content (supports Markdown)"
        defaultValue={section.content}
        onChange={(e) => onUpdate(section.id, 'content', e.target.value)}
        rows={4}
        className="mb-2"
      />
      <Input
        placeholder="Image URL (optional)"
        defaultValue={section.image_url || ''}
        onChange={(e) => onUpdate(section.id, 'image_url', e.target.value)}
      />
    </Card>
  )
}