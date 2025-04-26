export interface Team {
  id: number;
  name: string;
  abbreviation?: string;
  teamLogo?: string;
}

export interface GamePlayer {
  fantasyTeam: string;
  playerName: string;
  position: string;
  nhlId: number;
  imageUrl: string;
  goals: number;
  assists: number;
  points: number;
}

export interface Game {
  id: number;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  venue: string;
  homeTeamPlayers: GamePlayer[];
  awayTeamPlayers: GamePlayer[];
  homeTeamLogo: string;
  awayTeamLogo: string;
  homeScore: number;
  awayScore: number;
  gameState: string;
  period: string;
  seriesStatus: {
    round: number;
    seriesTitle: string;
    topSeedTeamAbbrev: string;
    topSeedWins: number;
    bottomSeedTeamAbbrev: string;
    bottomSeedWins: number;
    gameNumberOfSeries: number;
  };
}

export interface GamesResponse {
  date: string;
  games: Game[];
  summary: {
    totalGames: number;
    totalTeamsPlaying: number;
    teamPlayersCount: {
      nhlTeam: string;
      playerCount: number;
    }[];
  };
}
