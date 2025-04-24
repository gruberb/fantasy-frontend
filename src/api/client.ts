import { getTodayString, getYesterdayString } from "../utils/timezone";

import { API_URL } from "../config";

// Define API types based on response structure from your Rust server
export interface Team {
  id: number;
  name: string;
  abbreviation?: string;
  teamLogo?: string;
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

export interface Ranking {
  rank: number;
  teamId: number;
  teamName: string;
  goals: number;
  assists: number;
  totalPoints: number;
}

export interface Player {
  id?: number;
  name: string;
  teamId?: number;
  position: string;
  points?: number;
  jerseyNumber?: number;
  nhlTeam?: string;
  fantasyTeam?: string;
  fantasyTeamId?: number;
  fantasyTeamName?: string;
  imageUrl?: string;
  teamLogo?: string;
  playerName?: string; // Alternative name field used in some responses
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

export interface DailyFantasyRanking {
  rank: number;
  teamId: number;
  teamName: string;
  dailyPoints: number;
  playerHighlights: {
    playerName: string;
    points: number;
    nhlTeam: string;
    nhlId?: number;
    imageUrl?: string;
  }[];
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

export interface FantasyTeam {
  teamId: number;
  teamName: string;
}

export interface TopSkatersResponse {
  goals?: TopSkater[];
  assists?: TopSkater[];
}

// Helper function for API requests that handles the wrapped response structure
async function fetchApi<T>(endpoint: string): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    console.log(`Fetching from: ${url}`);
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const jsonData = await response.json();

    // Handle the wrapped response structure where data is inside a "success" and "data" structure
    if (
      jsonData &&
      typeof jsonData === "object" &&
      "success" in jsonData &&
      "data" in jsonData
    ) {
      return jsonData.data as T;
    }

    return jsonData as T;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
  }
}

// API client functions
export const api = {
  // Get all teams
  async getTeams(): Promise<Team[]> {
    return fetchApi<Team[]>("teams");
  },

  // Get team points
  async getTeamPoints(
    teamId: number,
    season: string = "20242025",
    gameType: number = 3,
  ): Promise<TeamPoints> {
    return fetchApi<TeamPoints>(
      `teams/${teamId}/points?season=${season}&game_type=${gameType}`,
    );
  },

  // Get rankings
  async getRankings(
    season: string = "20242025",
    gameType: number = 3,
  ): Promise<Ranking[]> {
    return fetchApi<Ranking[]>(
      `rankings?season=${season}&game_type=${gameType}`,
    );
  },

  // Get players per team
  async getPlayersPerTeam(): Promise<Record<string, Player[]>> {
    return fetchApi<Record<string, Player[]>>("players-per-team");
  },

  // Get team bets
  async getTeamBets(): Promise<TeamBetsResponse[]> {
    return fetchApi<TeamBetsResponse[]>("team-bets");
  },

  // Get games for a specific date
  async getGames(date: string): Promise<GamesResponse> {
    return fetchApi<GamesResponse>(`games?date=${date}`);
  },

  async getTodaysGames(): Promise<GamesResponse> {
    return this.getGames(getTodayString());
  },

  // Get yesterday's fantasy rankings
  async getYesterdayRankings(): Promise<DailyFantasyRanking[]> {
    const yesterdayString = getYesterdayString();
    return fetchApi<DailyFantasyRanking[]>(
      `daily-rankings?date=${yesterdayString}`,
    );
  },

  // Get daily fantasy summary for a specific date
  async getDailyFantasySummary(date: string): Promise<DailyFantasyRanking[]> {
    console.log(`Fetching daily rankings for ${date}`);
    return fetchApi<DailyFantasyRanking[]>(`daily-rankings?date=${date}`);
  },

  async getTopSkaters(limit: number = 10): Promise<TopSkatersResponse> {
    return fetchApi<TopSkatersResponse>(
      `get-top-skaters?category=goals,assists&limit=${limit}`,
    );
  },
};
