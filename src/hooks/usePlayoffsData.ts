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

  // Get teams still in playoffs (includes teams that have advanced to later rounds)
  const teamsInPlayoffs = useMemo(() => {
    if (!playoffsData || !playoffsData.rounds) return new Set<string>();
    
    const teamSet = new Set<string>();
    const currentRoundNum = playoffsData.currentRound;
    
    // Include all teams from current round
    const currentRound = playoffsData.rounds.find(
      (r) => r.roundNumber === currentRoundNum
    );
    
    if (currentRound) {
      currentRound.series.forEach((series) => {
        // Only add teams that haven't been eliminated
        // In a best-of-7 series, a team needs 4 wins to advance
        if (series.topSeed.wins < 4 && series.bottomSeed.wins < 4) {
          teamSet.add(series.topSeed.abbrev);
          teamSet.add(series.bottomSeed.abbrev);
        } else {
          // Add only the winner
          const winner = series.topSeed.wins === 4 
            ? series.topSeed.abbrev 
            : series.bottomSeed.abbrev;
          teamSet.add(winner);
        }
      });
    }
    
    // Also include teams from future rounds
    playoffsData.rounds
      .filter((round) => round.roundNumber > currentRoundNum)
      .forEach((round) => {
        round.series.forEach((series) => {
          // Add teams that are already known (not TBD)
          if (series.topSeed.abbrev !== "TBD") {
            teamSet.add(series.topSeed.abbrev);
          }
          if (series.bottomSeed.abbrev !== "TBD") {
            teamSet.add(series.bottomSeed.abbrev);
          }
        });
      });

    return teamSet;
  }, [playoffsData]);

  // Check if a team is in playoffs
  const isTeamInPlayoffs = useCallback(
    (teamAbbrev: string) => {
      return teamsInPlayoffs.has(teamAbbrev);
    },
    [teamsInPlayoffs]
  );

  // Get all playoff teams as an array
  const playoffTeamsArray = useMemo(() => {
    return Array.from(teamsInPlayoffs);
  }, [teamsInPlayoffs]);

  // Get teams that have advanced to the next round
  const advancedTeams = useMemo(() => {
    if (!playoffsData || !playoffsData.rounds) return new Set<string>();
    
    const teamSet = new Set<string>();
    const currentRoundNum = playoffsData.currentRound;
    
    // Get teams from future rounds
    playoffsData.rounds
      .filter((round) => round.roundNumber > currentRoundNum)
      .forEach((round) => {
        round.series.forEach((series) => {
          if (series.topSeed.abbrev !== "TBD") {
            teamSet.add(series.topSeed.abbrev);
          }
          if (series.bottomSeed.abbrev !== "TBD") {
            teamSet.add(series.bottomSeed.abbrev);
          }
        });
      });
    
    // Also check current round for series that are complete
    const currentRound = playoffsData.rounds.find(
      (r) => r.roundNumber === currentRoundNum
    );
    
    if (currentRound) {
      currentRound.series.forEach((series) => {
        if (series.topSeed.wins === 4) {
          teamSet.add(series.topSeed.abbrev);
        }
        if (series.bottomSeed.wins === 4) {
          teamSet.add(series.bottomSeed.abbrev);
        }
      });
    }
    
    return teamSet;
  }, [playoffsData]);

  return {
    playoffsData,
    isLoading,
    error,
    teamsInPlayoffs,
    isTeamInPlayoffs,
    playoffTeamsArray,
    advancedTeams,
    // Additional helper to check if a team has advanced
    hasTeamAdvanced: useCallback(
      (teamAbbrev: string) => {
        return advancedTeams.has(teamAbbrev);
      },
      [advancedTeams]
    ),
  };
}