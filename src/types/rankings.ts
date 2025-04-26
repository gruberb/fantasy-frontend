export interface Ranking {
  rank: number;
  teamId: number;
  teamName: string;
  goals: number;
  assists: number;
  totalPoints: number;
}

export interface PlayerHighlight {
  playerName: string;
  points: number;
  nhlTeam: string;
  imageUrl?: string;
  nhlId?: number;
}

export interface DailyRankingsResponse {
  date: string;
  rankings: RankingItem[];
}

export interface PlayoffTeamRanking {
  teamId: number;
  teamName: string;
  teamsInPlayoffs: number;
  totalTeams: number;
  playersInPlayoffs: number;
  totalPlayers: number;
  playoffScore: number;
  rank?: number;
  goals?: number;
  assists?: number;
  totalPoints?: number;
}

export interface RankingItem {
  rank: number;
  teamId: number;
  teamName: string;
  dailyPoints: number;
  playerHighlights: PlayerHighlight[];
}
