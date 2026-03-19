export interface MatchListItem {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo?: Array<{ name: string; shortname?: string; img?: string }>;
  score?: string;
  scoreDetail?: Array<{ inning: string; r: number; w: number; o: number }>;
  isLive?: boolean;
}

export interface MatchScoreDetail {
  id: string;
  name?: string;
  date?: string;
  dateTimeGMT?: string;
  matchStarted: boolean;
  matchEnded?: boolean;
  teamInfo?: Array<{ name: string; shortname?: string; img?: string }>;
  score?: string;
  status?: string;
  venue?: string;
}

/** match_info API: inning-wise score */
export interface MatchInfoScore {
  r: number;
  w: number;
  o: number;
  inning: string;
}

export interface BattingPlayerEntry {
  playerID?: string;
  playerName: string;
  dismissal?: string;
  runs: string | number;
  ballsFaced?: string | number;
  fours?: string | number;
  sixes?: string | number;
  href?: string;
}

export interface BowlingPlayerEntry {
  playerID?: string;
  playerName: string;
  overs?: string;
  maidens?: string | number;
  conceded?: string | number;
  wickets?: string | number;
  economyRate?: string;
  href?: string;
}

export interface BattingInnings {
  teamName: string;
  headline?: string;
  total?: string;
  extras?: string;
  playerDetails: BattingPlayerEntry[];
}

export interface BowlingInnings {
  teamName: string;
  headline?: string;
  playerDetails: BowlingPlayerEntry[];
}

export interface PlayingXIPlayer {
  id?: string;
  displayName: string;
  shortName?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  captain?: boolean;
}

export interface PlayingXITeam {
  teamName: string;
  players: PlayingXIPlayer[];
}

export interface CommentaryEntry {
  text: string;
  type?: string;
  dayNumber?: string;
}

export interface MatchInfoData {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo?: Array<{ name: string; shortname?: string; img?: string }>;
  score?: MatchInfoScore[];
  tossWinner?: string;
  tossChoice?: string;
  matchWinner?: string;
  matchStarted?: boolean;
  matchEnded?: boolean;
  playingXI?: PlayingXITeam[];
  battingInnings?: BattingInnings[];
  bowlingInnings?: BowlingInnings[];
  commentary?: CommentaryEntry[];
}

export interface CommentaryItem {
  over: number;
  ball: number;
  runs: number;
  text: string;
}

export interface RankingItem {
  rank: number;
  team: string;
  matches: number;
  points: number;
  rating: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: string;
}
