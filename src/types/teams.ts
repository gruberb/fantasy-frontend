import { PlayerStats } from "./players";

export interface FantasyTeam {
  teamId: number;
  teamName: string;
}

export interface TeamPoints {
  teamId: number;
  teamName: string;
  players: PlayerStats[];
  teamTotals: {
    goals: number;
    assists: number;
    totalPoints: number;
  };
}

export interface TeamBet {
  nhlTeam: string;
  nhlTeamName: string;
  numPlayers: number;
  teamLogo?: string;
}

export interface TeamBetsResponse {
  teamId: number;
  teamName: string;
  bets: TeamBet[];
}

export interface Team {
  id: number;
  name: string;
  abbreviation?: string;
  teamLogo?: string;
}
