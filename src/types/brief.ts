export interface BriefItem {
  label: string
  url?: string
}

export interface Brief {
  id: string
  title: string
  date: string         // ISO date string
  summary: string
  items: BriefItem[]
  category: string
}
