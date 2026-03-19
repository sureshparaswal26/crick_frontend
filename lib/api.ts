const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    next: { revalidate: 0 },
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getMatches: () => fetchApi<import('@/lib/types').MatchListItem[]>(`/api/cricket/matches`),
  getMatchScore: (id: string) =>
    fetchApi<{ match: import('@/lib/types').MatchScoreDetail; commentary: import('@/lib/types').CommentaryItem[] }>(
      `/api/cricket/matches/${encodeURIComponent(id)}`
    ),
  getMatchInfo: (id: string) =>
    fetchApi<import('@/lib/types').MatchInfoData | null>(`/api/cricket/matches/${encodeURIComponent(id)}/info`),
  getNews: () => fetchApi<import('@/lib/types').NewsItem[]>(`/api/cricket/news`),
};
