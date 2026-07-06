export type NewsCategory = 'RESCUE' | 'ADOPTION' | 'AWARENESS' | 'CAMPAIGN' | 'VOLUNTEER' | 'HEALTH' | 'COMMUNITY'

export interface NewsArticle {
  id: number
  title: string
  summary: string
  content?: string
  imageUrl?: string
  category: NewsCategory
  tags?: string[]
  featured: boolean
  publishedAt: string
  author?: string
}
