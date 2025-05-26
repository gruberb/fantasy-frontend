import { getTodayString, getYesterdayString } from "../utils/timezone";
import { API_URL } from "../config";
import {
  NHLTeam,
  FantasyTeamPoints,
  NHLTeamBetsResponse,
} from "../types/fantasyTeams";
import { GamesResponse } from "../types/games";
import { Ranking, RankingItem } from "../types/rankings";
import { TopSkatersResponse, Skater } from "../types/skaters";
import { PlayoffsResponse } from "../types/playoffs";

// Helper function for API requests
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
    console.log(jsonData);

    // API always returns {success: true, data: ...}
    if (!jsonData.success) {
      throw new Error(jsonData.error || "API request failed");
    }

    return jsonData.data as T;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// API client functions
export const api = {
  // Get all teams
  async getTeams(): Promise<NHLTeam[]> {
    return fetchApi<NHLTeam[]>("fantasy/teams");
  },

  // Get team with players and points
  async getTeamPoints(teamId: number): Promise<FantasyTeamPoints> {
    return fetchApi<FantasyTeamPoints>(`fantasy/teams/${teamId}`);
  },

  // Get rankings
  async getRankings(): Promise<Ranking[]> {
    return fetchApi<Ranking[]>("fantasy/rankings");
  },

  // Get players per team
  async getPlayersPerTeam(): Promise<Record<string, Skater[]>> {
    return fetchApi<Record<string, Skater[]>>("fantasy/players");
  },

  // Get team bets
  async getTeamBets(): Promise<NHLTeamBetsResponse[]> {
    return fetchApi<NHLTeamBetsResponse[]>("fantasy/team-bets");
  },

  // Get games for a specific date
  async getGames(date: string): Promise<GamesResponse> {
    return fetchApi<GamesResponse>(`nhl/games?date=${date}`);
  },

  async getTodaysGames(): Promise<GamesResponse> {
    return this.getGames(getTodayString());
  },

  // Get yesterday's fantasy rankings
  async getYesterdayRankings(): Promise<RankingItem[]> {
    const yesterdayString = getYesterdayString();
    return fetchApi<RankingItem[]>(
      `fantasy/rankings/daily?date=${yesterdayString}`,
    );
  },

  // Get daily fantasy summary for a specific date
  async getDailyFantasySummary(date: string): Promise<RankingItem[]> {
    console.log(`Fetching daily rankings for ${date}`);
    return fetchApi<RankingItem[]>(`fantasy/rankings/daily?date=${date}`);
  },

  async getTopSkaters(
    limit: number,
    season: number,
    gameType: number,
    formGames: number,
  ): Promise<TopSkatersResponse> {
    return fetchApi<TopSkatersResponse>(
      `nhl/skaters/top?limit=${limit}&season=${season}&game_type=${gameType}&form_games=${formGames}`,
    );
  },

  async getPlayoffs(season: string = "20242025"): Promise<PlayoffsResponse> {
    return fetchApi<PlayoffsResponse>(`nhl/playoffs?season=${season}`);
  },

  async getSleepers() {
    return fetchApi<Skater[]>("fantasy/sleepers");
  },

  // Get team stats
  async getTeamStats() {
    return fetchApi<TeamStats[]>("fantasy/team-stats");
  },

  async getMatchDay(): Promise<any> {
    return fetchApi<any>(`nhl/match-day`);
  },
};
