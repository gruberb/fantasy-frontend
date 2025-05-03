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

  // Track teams that have been eliminated
  const eliminatedTeams = useMemo(() => {
    if (!playoffsData || !playoffsData.rounds) return new Set<string>();

    const teamSet = new Set<string>();

    // A team is eliminated if they lost a series (opponent has 4 wins)
    playoffsData.rounds.forEach((round) => {
      round.series.forEach((series) => {
        if (series.topSeed.wins === 4) {
          teamSet.add(series.bottomSeed.abbrev);
        } else if (series.bottomSeed.wins === 4) {
          teamSet.add(series.topSeed.abbrev);
        }
      });
    });

    return teamSet;
  }, [playoffsData]);

  // Get teams still in playoffs (not eliminated)
  const teamsInPlayoffs = useMemo(() => {
    if (!playoffsData || !playoffsData.rounds) return new Set<string>();

    const teamSet = new Set<string>();

    // Add all teams from all rounds
    playoffsData.rounds.forEach((round) => {
      round.series.forEach((series) => {
        teamSet.add(series.topSeed.abbrev);
        teamSet.add(series.bottomSeed.abbrev);
      });
    });

    // Remove eliminated teams
    eliminatedTeams.forEach((team) => {
      teamSet.delete(team);
    });

    return teamSet;
  }, [playoffsData, eliminatedTeams]);

  // Get teams that have advanced to the next round
  const advancedTeams = useMemo(() => {
    if (!playoffsData || !playoffsData.rounds) return new Set<string>();

    const teamSet = new Set<string>();
    const currentRoundNum = playoffsData.currentRound;

    // Process completed series in current and previous rounds
    playoffsData.rounds
      .filter((round) => round.roundNumber <= currentRoundNum)
      .forEach((round) => {
        round.series.forEach((series) => {
          // If top seed won
          if (series.topSeed.wins === 4) {
            teamSet.add(series.topSeed.abbrev);
          }
          // If bottom seed won
          else if (series.bottomSeed.wins === 4) {
            teamSet.add(series.bottomSeed.abbrev);
          }
        });
      });

    // Also add any teams that appear in future rounds
    playoffsData.rounds
      .filter((round) => round.roundNumber > currentRoundNum)
      .forEach((round) => {
        round.series.forEach((series) => {
          if (series.topSeed.abbrev && series.topSeed.abbrev !== "TBD") {
            teamSet.add(series.topSeed.abbrev);
          }
          if (series.bottomSeed.abbrev && series.bottomSeed.abbrev !== "TBD") {
            teamSet.add(series.bottomSeed.abbrev);
          }
        });
      });

    // Remove any teams that have been eliminated
    eliminatedTeams.forEach((team) => {
      teamSet.delete(team);
    });

    return teamSet;
  }, [playoffsData, eliminatedTeams]);

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

  // Get all teams in the current round
  const teamsInCurrentRound = useMemo(() => {
    if (!playoffsData || !playoffsData.rounds) return new Set<string>();

    const teamSet = new Set<string>();
    const currentRoundNum = playoffsData.currentRound;

    const currentRound = playoffsData.rounds.find(
      (r) => r.roundNumber === currentRoundNum,
    );

    if (currentRound) {
      currentRound.series.forEach((series) => {
        // Only add valid teams that haven't been eliminated
        if (
          series.topSeed.abbrev &&
          series.topSeed.abbrev !== "TBD" &&
          !eliminatedTeams.has(series.topSeed.abbrev)
        ) {
          teamSet.add(series.topSeed.abbrev);
        }
        if (
          series.bottomSeed.abbrev &&
          series.bottomSeed.abbrev !== "TBD" &&
          !eliminatedTeams.has(series.bottomSeed.abbrev)
        ) {
          teamSet.add(series.bottomSeed.abbrev);
        }
      });
    }

    return teamSet;
  }, [playoffsData, eliminatedTeams]);

  return {
    playoffsData,
    isLoading,
    error,
    teamsInPlayoffs,
    isTeamInPlayoffs,
    playoffTeamsArray,
    advancedTeams,
    teamsInCurrentRound,
    eliminatedTeams,
    // Additional helper to check if a team has advanced
    hasTeamAdvanced: useCallback(
      (teamAbbrev: string) => {
        return advancedTeams.has(teamAbbrev);
      },
      [advancedTeams],
    ),
    // Helper to check if a team has been eliminated
    isTeamEliminated: useCallback(
      (teamAbbrev: string) => {
        return eliminatedTeams.has(teamAbbrev);
      },
      [eliminatedTeams],
    ),
    // Helper to check if a team is specifically in the current round
    isTeamInCurrentRound: useCallback(
      (teamAbbrev: string) => {
        return teamsInCurrentRound.has(teamAbbrev);
      },
      [teamsInCurrentRound],
    ),
  };
}
