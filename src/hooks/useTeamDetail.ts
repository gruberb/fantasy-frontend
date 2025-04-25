import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { api } from "../api/client";
import { usePlayoffsData } from "./usePlayoffsData";
import { getNHLTeamUrlSlug } from "../utils/nhlTeams";
import { PlayerStats } from "../types/players";
import { TeamBet } from "../types/teams";

export function useTeamDetail(teamId: number) {
  // ALWAYS call all hooks at the top level, unconditionally
  const { isTeamInPlayoffs, isLoading: playoffsLoading } = usePlayoffsData();

  // Fetch team data
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: api.getTeams,
  });

  // Fetch team points
  const { data: teamPoints, isLoading: pointsLoading } = useQuery({
    queryKey: ["teamPoints", teamId],
    queryFn: () => api.getTeamPoints(teamId),
    enabled: !!teamId,
  });

  // Fetch team bets
  const { data: teamBets, isLoading: betsLoading } = useQuery({
    queryKey: ["teamBets"],
    queryFn: api.getTeamBets,
  });

  // Calculate playoff-related data using useMemo
  const playoffStats = useMemo(() => {
    // Default values when data isn't loaded yet
    const defaultStats = {
      teamsInPlayoffs: [] as TeamBet[],
      playersInPlayoffs: [] as PlayerStats[],
    };

    // Only calculate if all dependencies are available
    if (!teamPoints || !teamBets || playoffsLoading || !isTeamInPlayoffs) {
      return defaultStats;
    }

    // Find the team's bets
    const currentTeamBets =
      teamBets.find((tb) => tb.teamId === teamId)?.bets || [];

    // Check if players array exists before accessing it
    const players = teamPoints?.players || [];

    // Filter for teams and players in playoffs
    const teamsInPlayoffs = currentTeamBets.filter((bet) =>
      isTeamInPlayoffs(bet.nhlTeam),
    );

    const playersInPlayoffs = players
      .filter((player) => isTeamInPlayoffs(player.nhlTeam || ""))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    return {
      teamsInPlayoffs,
      playersInPlayoffs,
    };
  }, [teamId, teamPoints, teamBets, playoffsLoading, isTeamInPlayoffs]);

  // Find the team in the teams array
  const team = useMemo(() => {
    return teams?.find((t) => t.id === teamId);
  }, [teams, teamId]);

  // Process players to add URL slugs
  const processedPlayers = useMemo(() => {
    if (!teamPoints?.players) {
      return [];
    }

    return teamPoints.players.map((player) => ({
      ...player,
      nhlTeamUrlSlug: getNHLTeamUrlSlug(player.nhlTeam || ""),
    }));
  }, [teamPoints?.players]);

  // Get team bets
  const currentTeamBets = useMemo(() => {
    return teamBets?.find((tb) => tb.teamId === teamId)?.bets || [];
  }, [teamBets, teamId]);

  // Loading state
  const isLoading =
    teamsLoading || pointsLoading || betsLoading || playoffsLoading;

  // Error state
  const hasError = !team || !teamPoints;

  return {
    team,
    teamPoints,
    processedPlayers,
    currentTeamBets,
    playoffStats,
    isLoading,
    hasError,
  };
}
