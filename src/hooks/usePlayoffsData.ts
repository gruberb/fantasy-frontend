import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useMemo, useCallback } from "react";

export function usePlayoffsData() {
  const {
    data: playoffsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["playoffs"],
    queryFn: () => api.getPlayoffs(),
  });

  // Get teams still in playoffs
  const teamsInPlayoffs = useMemo(() => {
    if (!playoffsData) return new Set<string>();

    const teamSet = new Set<string>();

    // For the current round
    const currentRound = playoffsData.rounds.find(
      (r) => r.roundNumber === playoffsData.currentRound,
    );

    if (currentRound) {
      currentRound.series.forEach((series) => {
        teamSet.add(series.topSeed.abbrev);
        teamSet.add(series.bottomSeed.abbrev);
      });
    }

    return teamSet;
  }, [playoffsData]);

  // Check if a team is in playoffs
  const isTeamInPlayoffs = useCallback(
    (teamAbbrev: string) => {
      return teamsInPlayoffs.has(teamAbbrev);
    },
    [teamsInPlayoffs],
  );

  // Get all playoff teams as an array
  const playoffTeamsArray = useMemo(() => {
    return Array.from(teamsInPlayoffs);
  }, [teamsInPlayoffs]);

  return {
    playoffsData,
    isLoading,
    error,
    teamsInPlayoffs,
    isTeamInPlayoffs,
    playoffTeamsArray,
  };
}
