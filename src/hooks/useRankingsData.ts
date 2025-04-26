import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { usePlayoffsData } from "./usePlayoffsData";
import { toLocalDateString, dateStringToLocalDate } from "../utils/timezone";
import { PlayoffTeamRanking } from "../types/rankings";
import { TeamPoints } from "../types/teams";

export function useRankingsData() {
  // Default to yesterday's date
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    // Return YYYY-MM-DD in **local** time
    return toLocalDateString(yesterday);
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

  // Create a list of team IDs from rankings
  const teamIds = rankings?.map((team) => team.teamId) || [];

  // Get team points data for all teams
  const { data: allTeamPoints, isLoading: teamPointsLoading } = useQuery({
    queryKey: ["allTeamPoints"],
    queryFn: async () => {
      if (!teamIds.length) return {} as Record<number, TeamPoints>;

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
        {} as Record<number, TeamPoints>,
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

  // Calculate playoff rankings
  const playoffRankings = useMemo<PlayoffTeamRanking[]>(() => {
    if (!rankings || !teamBets || !allTeamPoints || !isTeamInPlayoffs)
      return [];

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

        return {
          ...team,
          teamsInPlayoffs,
          totalTeams,
          playersInPlayoffs,
          totalPlayers,
          // Weight players higher than teams since they're harder to get right
          playoffScore: teamsInPlayoffs * 10 + playersInPlayoffs * 5,
        };
      })
      .sort((a, b) => b.playoffScore - a.playoffScore);
  }, [rankings, teamBets, allTeamPoints, isTeamInPlayoffs]);

  // Convert the selected date to a Date object
  const displayDate = dateStringToLocalDate(selectedDate);

  // Loading state for the playoff rankings
  const playoffRankingsLoading =
    rankingsLoading || teamBetsLoading || teamPointsLoading;

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
  };
}
