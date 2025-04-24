import { getTodayString, getYesterdayString } from "../utils/timezone";

import { API_URL } from "../config";

// Define API types based on response structure from your Rust server
export interface Team {
  id: number;
  name: string;
  abbreviation?: string;
  team_logo?: string;
}

export interface PlayerStats {
  name: string;
  nhl_team: string;
  nhl_id: number;
  position: string;
  goals: number;
  assists: number;
  total_points: number;
  image_url?: string;
  team_logo?: string;
}

export interface TeamPoints {
  team_id: number;
  team_name: string;
  players: PlayerStats[];
  team_totals: {
    goals: number;
    assists: number;
    total_points: number;
  };
}

export interface Ranking {
  rank: number;
  team_id: number;
  team_name: string;
  goals: number;
  assists: number;
  total_points: number;
}

export interface Player {
  id?: number;
  name: string;
  team_id?: number;
  position: string;
  jersey_number?: number;
  nhl_team?: string;
  fantasy_team?: string;
  fantasy_team_id?: number;
  fantasy_team_name?: string;
  image_url?: string;
  team_logo?: string;
  player_name?: string; // Alternative name field used in some responses
}

export interface TeamBet {
  nhl_team: string;
  nhl_team_name: string;
  num_players: number;
  team_logo?: string;
}

export interface TeamBetsResponse {
  team_id: number;
  team_name: string;
  bets: TeamBet[];
}

export interface Game {
  id: number;
  home_team: string;
  away_team: string;
  start_time: string;
  venue: string;
  home_team_players: Player[];
  away_team_players: Player[];
  home_team_logo?: string;
  away_team_logo?: string;
  home_score?: number | null;
  away_score?: number | null;
  home_team_id?: number;
  away_team_id?: number;
  status?: string;
  game_state?: string;
  period?: string;
  series_status: {
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
    total_games: number;
    total_teams_playing: number;
    team_players_count: {
      nhl_team: string;
      player_count: number;
    }[];
  };
}

export interface DailyFantasyRanking {
  rank: number;
  team_id: number;
  team_name: string;
  daily_points: number;
  player_highlights: {
    player_name: string;
    points: number;
    nhl_team: string;
    nhl_id?: number;
    image_url?: string;
  }[];
}

export interface TopSkater {
  id: number;
  first_name: string;
  last_name: string;
  sweater_number?: number;
  headshot: string;
  team_abbrev: string;
  team_name: string;
  team_logo: string;
  position: string;
  value: number;
  category: string;
  fantasy_team: FantasyTeam;
}

export interface FantasyTeam {
  team_id: number;
  team_name: string;
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

  async getTopSkaters(): Promise<TopSkatersResponse> {
    return fetchApi<TopSkatersResponse>(
      "get-top-skaters?category=goals,assists",
    );
  },
};
