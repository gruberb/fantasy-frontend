import { Player } from "./players";

export interface Team {
  id: number;
  name: string;
  abbreviation?: string;
  teamLogo?: string;
}

export interface Game {
  id: number;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  venue: string;
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeamId?: number;
  awayTeamId?: number;
  status?: string;
  gameState?: string;
  period?: string;
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
