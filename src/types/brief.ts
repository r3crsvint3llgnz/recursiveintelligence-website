export interface BriefItem {
  title:   string
  url:     string
  source:  string
  snippet: string
}

export interface Brief {
  id:          string
  entity_type: string
  title:       string
  date:        string       // ISO 8601
  summary:     string
  category:    string
  body:        string       // Full markdown body
  items:       BriefItem[]
  is_latest:   boolean
}
