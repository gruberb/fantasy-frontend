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

export interface DailyFantasyRanking {
  rank: number;
  teamId: number;
  teamName: string;
  dailyPoints: number;
  playerHighlights: PlayerHighlight[];
}

export interface DailyRankingsResponse {
  date: string;
  rankings: DailyFantasyRanking[];
}

export interface PlayoffTeamRanking extends Ranking {
  teamsInPlayoffs: number;
  totalTeams: number;
  playersInPlayoffs: number;
  totalPlayers: number;
  playoffScore: number;
}
