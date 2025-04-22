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

// MOCK DATA FOR FALLBACK
const MOCK_TEAMS: Team[] = [
  { id: 1, name: "Emma" },
  { id: 2, name: "Bastian" },
  { id: 3, name: "Zac" },
  { id: 4, name: "Ben" },
  { id: 5, name: "Henry" },
  { id: 6, name: "Mikey" },
  { id: 7, name: "Mike" },
];

const MOCK_RANKINGS: Ranking[] = [
  {
    rank: 1,
    team_id: 4,
    team_name: "Ben",
    goals: 3,
    assists: 5,
    total_points: 8,
  },
  {
    rank: 2,
    team_id: 6,
    team_name: "Mikey",
    goals: 2,
    assists: 6,
    total_points: 8,
  },
  {
    rank: 3,
    team_id: 1,
    team_name: "Emma",
    goals: 2,
    assists: 5,
    total_points: 7,
  },
  {
    rank: 4,
    team_id: 3,
    team_name: "Zac",
    goals: 4,
    assists: 2,
    total_points: 6,
  },
  {
    rank: 5,
    team_id: 2,
    team_name: "Bastian",
    goals: 2,
    assists: 3,
    total_points: 5,
  },
  {
    rank: 6,
    team_id: 5,
    team_name: "Henry",
    goals: 3,
    assists: 2,
    total_points: 5,
  },
  {
    rank: 7,
    team_id: 7,
    team_name: "Mike",
    goals: 0,
    assists: 1,
    total_points: 1,
  },
];

// Helper function for API requests that handles the wrapped response structure
async function fetchApi<T>(endpoint: string, mockData: T): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    console.log(`Fetching from: ${url}`);
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`API error (${response.status}): Falling back to mock data`);
      return mockData;
    }

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
    console.warn(`API request failed for ${endpoint}:`, error);
    console.log("Using mock data instead");
    return mockData;
  }
}

// API client functions
export const api = {
  // Get all teams
  async getTeams(): Promise<Team[]> {
    return fetchApi<Team[]>("teams", MOCK_TEAMS);
  },

  // Get team points
  async getTeamPoints(
    teamId: number,
    season: string = "20242025",
    gameType: number = 3,
  ): Promise<TeamPoints> {
    // Default mock response matching the structure
    const mockTeamPoints: TeamPoints = {
      team_id: teamId,
      team_name: MOCK_TEAMS.find((t) => t.id === teamId)?.name || "Unknown",
      players: [],
      team_totals: {
        goals: 0,
        assists: 0,
        total_points: 0,
      },
    };

    return fetchApi<TeamPoints>(
      `teams/${teamId}/points?season=${season}&game_type=${gameType}`,
      mockTeamPoints,
    );
  },

  // Get rankings
  async getRankings(
    season: string = "20242025",
    gameType: number = 3,
  ): Promise<Ranking[]> {
    return fetchApi<Ranking[]>(
      `rankings?season=${season}&game_type=${gameType}`,
      MOCK_RANKINGS,
    );
  },

  // Get players per team
  async getPlayersPerTeam(): Promise<Record<string, Player[]>> {
    // This is a simplified mock structure - adjust based on your actual API
    const mockPlayersPerTeam: Record<string, Player[]> = {};
    return fetchApi<Record<string, Player[]>>(
      "players-per-team",
      mockPlayersPerTeam,
    );
  },

  // Get team bets
  async getTeamBets(): Promise<TeamBetsResponse[]> {
    // Mock response based on the structure seen in the API response
    const mockTeamBets: TeamBetsResponse[] = MOCK_TEAMS.map((team) => ({
      team_id: team.id,
      team_name: team.name,
      bets: [],
    }));

    return fetchApi<TeamBetsResponse[]>("team-bets", mockTeamBets);
  },

  // Get games for a specific date
  async getGames(date: string): Promise<GamesResponse> {
    // Mock response based on the structure seen in the API response
    const mockGames: GamesResponse = {
      date: date,
      games: [],
      summary: {
        total_games: 0,
        total_teams_playing: 0,
        team_players_count: [],
      },
    };

    return fetchApi<GamesResponse>(`games?date=${date}`, mockGames);
  },

  // Get today's games (convenience method)
  async getTodaysGames(): Promise<GamesResponse> {
    // Use the direct endpoint for today's games
    const mockGames: GamesResponse = {
      date: new Date().toISOString().split("T")[0],
      games: [],
      summary: {
        total_games: 0,
        total_teams_playing: 0,
        team_players_count: [],
      },
    };

    // Use the specific todays-games endpoint without any date parameter
    return fetchApi<GamesResponse>("todays-games", mockGames);
  },
};
