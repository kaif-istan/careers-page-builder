// src/types/index.ts
export type Company = {
    id: string
    slug: string
    name: string
    logo_url: string | null
    banner_url: string | null
    primary_color: string
    culture_video_url: string | null
  }
  
  export type Section = {
    id: string
    company_id: string
    type: 'about' | 'culture' | 'values' | 'benefits' | 'team'
    title: string
    content: string
    image_url: string | null
    order_index: number
  }