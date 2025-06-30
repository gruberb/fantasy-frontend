import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { APP_CONFIG } from "../config";
import { usePlayoffsData } from "./usePlayoffsData";
import { getFixedAnalysisDateString, dateStringToLocalDate } from "../utils/timezone";
import { PlayoffFantasyTeamRanking } from "../types/rankings";
import { FantasyTeamPoints } from "../types/fantasyTeams";
import { TeamStats } from "../types/teamStats";

export function useRankingsData() {
  // State for date selector - initialized from URL parameter if valid, otherwise use fixed analysis date
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Otherwise, use the fixed analysis date (June 17, 2024)
    return getFixedAnalysisDateString();
  });

  const { isTeamInPlayoffs } = usePlayoffsData();

  // Get rankings data
  const {
    data: rankings,
    isLoading: rankingsLoading,
    error: rankingsError,
  } = useQuery({
    queryKey: ["rankings"],
    queryFn: () => api.getRankings(),
  });

  // Get team bets data
  const { data: teamBets, isLoading: teamBetsLoading } = useQuery({
    queryKey: ["teamBets"],
    queryFn: api.getTeamBets,
  });

  // Fetch sleepers data
  const {
    data: sleepersData,
    isLoading: sleepersLoading,
    error: sleepersError,
  } = useQuery({
    queryKey: ["sleepers"],
    queryFn: () => api.getSleepers(),
  });

  // Fetch team stats
  const {
    data: teamStats,
    isLoading: teamStatsLoading,
    error: teamStatsError,
  } = useQuery<TeamStats[]>({
    queryKey: ["teamStats"],
    queryFn: () => api.getTeamStats(),
  });

  // Create a list of team IDs from rankings
  const teamIds = rankings?.map((team) => team.teamId) || [];

  // Get team points data for all teams
  const { data: allTeamPoints, isLoading: teamPointsLoading } = useQuery({
    queryKey: ["allTeamPoints"],
    queryFn: async () => {
      if (!teamIds.length) return {} as Record<number, FantasyTeamPoints>;

      // Fetch all team points data in parallel
      const results = await Promise.all(
        teamIds.map((id) => api.getTeamPoints(id).catch(() => null)),
      );

      return results.reduce(
        (acc, data, index) => {
          if (data) {
            acc[teamIds[index]] = data;
          }
          return acc;
        },
        {} as Record<number, FantasyTeamPoints>,
      );
    },
    enabled: teamIds.length > 0,
  });

  // Get daily rankings data
  const {
    data: dailyRankings,
    isLoading: dailyRankingsLoading,
    error: dailyRankingsError,
  } = useQuery({
    queryKey: ["dailyRankings", selectedDate],
    queryFn: () => api.getDailyFantasySummary(selectedDate),
    retry: 1,
  });

  // Fetch top skaters data
  const { data: topTenSkaters, isLoading: topSkatersLoading } = useQuery({
    queryKey: ["topSkaters", 10], // Include the limit in the key
    queryFn: () =>
      api.getTopSkaters(
        10,
        parseInt(APP_CONFIG.DEFAULT_SEASON),
        APP_CONFIG.DEFAULT_GAME_TYPE,
        5, // form games
      ),
  });

  // Calculate playoff rankings
  const playoffRankings = useMemo<PlayoffFantasyTeamRanking[]>(() => {
    if (!rankings || !teamBets || !allTeamPoints || !isTeamInPlayoffs)
      return [];

    // Count top players per team ID
    const topPlayersByTeam = new Map<number, number>();

    if (topTenSkaters && Array.isArray(topTenSkaters)) {
      topTenSkaters.forEach((skater) => {
        if (
          skater.fantasyTeam &&
          typeof skater.fantasyTeam.teamId === "number"
        ) {
          const teamId = skater.fantasyTeam.teamId;
          topPlayersByTeam.set(teamId, (topPlayersByTeam.get(teamId) || 0) + 1);
        }
      });
    }

    return rankings
      .map((team) => {
        const teamBet = teamBets.find((tb) => tb.teamId === team.teamId);
        const bets = teamBet?.bets || [];

        const teamsInPlayoffs = bets.filter((bet) =>
          isTeamInPlayoffs(bet.nhlTeam),
        ).length;
        const totalTeams = bets.length;

        // Safely access team points data
        const teamPoints = allTeamPoints[team.teamId];
        const players = teamPoints?.players || [];
        const playersInPlayoffs = players.filter((p) =>
          isTeamInPlayoffs(p.nhlTeam || ""),
        ).length;
        const totalPlayers = players.length;

        // Get top players count for this team
        const topTenPlayersCount = topPlayersByTeam.get(team.teamId) || 0;

        return {
          ...team,
          teamsInPlayoffs,
          totalTeams,
          playersInPlayoffs,
          totalPlayers,
          topTenPlayersCount,
          // Weight players higher than teams since they're harder to get right
          playoffScore:
            teamsInPlayoffs * 10 +
            playersInPlayoffs * 5 +
            topTenPlayersCount * 20,
        };
      })
      .sort((a, b) => b.playoffScore - a.playoffScore);
  }, [rankings, teamBets, allTeamPoints, isTeamInPlayoffs, topTenSkaters]);

  // Loading state for the playoff rankings
  const playoffRankingsLoading =
    rankingsLoading ||
    teamBetsLoading ||
    teamPointsLoading ||
    topSkatersLoading;

  const displayDate = dateStringToLocalDate(selectedDate);

  return {
    selectedDate,
    setSelectedDate,
    displayDate,
    rankings,
    rankingsLoading,
    rankingsError,
    dailyRankings,
    dailyRankingsLoading,
    dailyRankingsError,
    playoffRankings,
    playoffRankingsLoading,
    sleepersData,
    sleepersLoading,
    sleepersError,
    teamStats,
    teamStatsLoading,
    teamStatsError,
  };
}
