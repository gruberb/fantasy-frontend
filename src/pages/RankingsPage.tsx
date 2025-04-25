// src/pages/RankingsPage.tsx - Fix the missing imports and playoffRankings

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { usePlayoffsData } from "../hooks/usePlayoffsData";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import DailyRankingsCard from "../components/DailyRankingsCard";
import RankingsTable from "../components/RankingsTable";
import PlayoffRankingsTable from "../components/PlayoffsRankingTable";
import DatePickerHeader from "../components/DatePickerHeader";
import { toLocalDateString, dateStringToLocalDate } from "../utils/timezone";

const RankingsPage = () => {
  // Default to yesterday's date
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    // Return YYYY-MM-DD in **local** time
    return toLocalDateString(yesterday);
  });

  const { isTeamInPlayoffs } = usePlayoffsData();

  const {
    data: rankings,
    isLoading: rankingsLoading,
    error: rankingsError,
  } = useQuery({
    queryKey: ["rankings"],
    queryFn: () => api.getRankings(),
  });

  const { data: teamBets, isLoading: teamBetsLoading } = useQuery({
    queryKey: ["teamBets"],
    queryFn: api.getTeamBets,
  });

  const teamIds = rankings?.map((team) => team.teamId) || [];

  const { data: allTeamPoints, isLoading: teamPointsLoading } = useQuery({
    queryKey: ["allTeamPoints"],
    queryFn: async () => {
      if (!teamIds.length) return {};

      // Fetch all team points data in parallel
      const results = await Promise.all(
        teamIds.map((id) => api.getTeamPoints(id).catch(() => null)),
      );

      // Create a map of teamId -> points data
      return results.reduce((acc, data, index) => {
        if (data) acc[teamIds[index]] = data;
        return acc;
      }, {});
    },
    enabled: teamIds.length > 0,
  });

  // Calculate playoff rankings
  const playoffRankings = useMemo(() => {
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

  const {
    data: dailyRankings,
    isLoading: dailyRankingsLoading,
    error: dailyRankingsError,
  } = useQuery({
    queryKey: ["dailyRankings", selectedDate],
    queryFn: () => api.getDailyFantasySummary(selectedDate),
    retry: 1,
  });

  const displayDate = dateStringToLocalDate(selectedDate);

  // Loading state for the playoff rankings
  const playoffRankingsLoading =
    rankingsLoading || teamBetsLoading || teamPointsLoading;

  return (
    <div>
      {/* Header section */}
      <DatePickerHeader
        title="Fantasy NHL Rankings"
        subtitle="Check out daily scores and how the Playoffs overall go for each fantasy team."
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Daily Fantasy Scores */}
      {dailyRankingsLoading ? (
        <LoadingSpinner message="Loading daily rankings..." />
      ) : dailyRankingsError ? (
        <div className="card">
          <ErrorMessage message="Failed to load daily rankings. Please try again." />
        </div>
      ) : (
        <DailyRankingsCard
          rankings={dailyRankings || []}
          date={displayDate}
          title="Daily Fantasy Scores"
          limit={100}
        />
      )}

      {/* Season Rankings Table */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Season Rankings</h2>
        {rankingsLoading ? (
          <LoadingSpinner message="Loading season rankings..." />
        ) : rankingsError ? (
          <ErrorMessage message="Failed to load season rankings. Please try again." />
        ) : (
          <div className="card overflow-x-auto">
            <RankingsTable rankings={rankings} />
          </div>
        )}
      </div>

      {/* Playoff Rankings */}
      <div className="mt-8">
        {playoffRankingsLoading ? (
          <LoadingSpinner message="Loading playoff rankings..." />
        ) : (
          <PlayoffRankingsTable playoffRankings={playoffRankings} />
        )}
      </div>
    </div>
  );
};

export default RankingsPage;
