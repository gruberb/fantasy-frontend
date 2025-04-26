import { FantasyTeam } from "./teams";

export interface PlayerWithPoints {
  name?: string;
  playerName?: string;
  position: string;
  fantasyTeam?: string;
  points?: number;
  goals?: number;
  assists?: number;
  gameId?: number;
  nhlTeam?: string;
  teamLogo?: string;
  imageUrl?: string;
  nhlId?: number;
}

export interface Player {
  id?: number;
  nhlId?: number;
  name?: string;
  playerName?: string;
  position: string;
  points?: number;
  jerseyNumber?: number;
  nhlTeam?: string;
  fantasyTeam?: string;
  imageUrl?: string;
  teamLogo?: string;
  goals?: number;
  assists?: number;
}

export interface PlayerStats {
  name: string;
  nhlTeam: string;
  nhlId: number;
  position: string;
  goals: number;
  assists: number;
  totalPoints: number;
  imageUrl?: string;
  teamLogo?: string;
  nhlTeamUrlSlug?: string;
}

export interface TopSkater {
  id: number;
  firstName: string;
  lastName: string;
  sweaterNumber?: number;
  headshot: string;
  teamAbbrev: string;
  teamName: string;
  teamLogo: string;
  position: string;
  value: number;
  category: string;
  fantasyTeam: FantasyTeam;
}

export interface TopSkatersResponse {
  goals?: TopSkater[];
  assists?: TopSkater[];
}

export interface PlayerWithTeam extends PlayerStats {
  teamName?: string;
  teamId?: number;
  teamAbbreviation?: string;
  nhlTeamUrlSlug?: string;
}
