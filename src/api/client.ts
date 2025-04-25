// src/api/client.ts
import { getTodayString, getYesterdayString } from "../utils/timezone";
import { API_URL } from "../config";
import { Team, TeamPoints, TeamBetsResponse } from "../types/teams";
import { Player, GamesResponse } from "../types/games";
import { Ranking, DailyFantasyRanking } from "../types/rankings";
import { TopSkatersResponse } from "../types/players";
import { PlayoffsResponse } from "../types/playoffs";

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
    throw error;
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

  async getPlayoffs(season: string = "20242025"): Promise<PlayoffsResponse> {
    return fetchApi<PlayoffsResponse>(`playoffs?season=${season}`);
  },
};
