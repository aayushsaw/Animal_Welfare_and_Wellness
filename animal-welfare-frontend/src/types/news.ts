export type NewsCategory = 'WELFARE_NEWS' | 'SUCCESS_STORY' | 'CAMPAIGN' | 'NGO_UPDATE'

export interface NewsArticle {
  id: number
  title: string
  summary: string
  content?: string
  imageUrl?: string
  category: NewsCategory
  tags?: string[]
  featured: boolean
  publishDate: string
  author?: string
}
