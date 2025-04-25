export interface PlayoffTeam {
  id: number;
  abbrev: string;
  wins: number;
}

export interface PlayoffSeries {
  seriesLetter: string;
  roundNumber: number;
  seriesLabel: string;
  bottomSeed: PlayoffTeam;
  topSeed: PlayoffTeam;
}

export interface PlayoffRound {
  roundNumber: number;
  roundLabel: string;
  roundAbbrev: string;
  series: PlayoffSeries[];
}

export interface PlayoffsResponse {
  currentRound: number;
  rounds: PlayoffRound[];
}
