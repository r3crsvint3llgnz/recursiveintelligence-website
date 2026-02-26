export interface RaindropItem {
  _id: number
  title: string
  link: string
  note: string
  created: string
  tags: string[]
}

const COLLECTION_ID = '67035667'

export async function fetchReadingList(): Promise<RaindropItem[]> {
  const token = process.env.RAINDROP_TOKEN
  if (!token) throw new Error('RAINDROP_TOKEN is not configured')

  const res = await fetch(
    `https://api.raindrop.io/rest/v1/raindrops/${COLLECTION_ID}?perpage=50&sort=-created`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  )
  if (!res.ok) throw new Error(`Raindrop API error: ${res.status}`)
  const data = (await res.json()) as { items?: RaindropItem[] }
  return data.items ?? []
}
