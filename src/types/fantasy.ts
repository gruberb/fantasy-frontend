import { PlayerWithPoints } from "./players";

export interface FantasyTeamCount {
  teamId: number;
  teamName: string;
  teamLogo?: string;
  playerCount: number;
  players: PlayerWithPoints[];
  totalPoints: number;
}
