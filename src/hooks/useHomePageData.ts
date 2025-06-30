import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { getFixedAnalysisDateString, dateStringToLocalDate } from "../utils/timezone";

export function useHomePageData() {
  // Yesterday's date for rankings
  const analysisDateString = getFixedAnalysisDateString();
  const analysisDate = dateStringToLocalDate(analysisDateString);

  // Rankings query
  const {
    data: rankings,
    isLoading: rankingsLoading,
    error: rankingsError,
  } = useQuery({
    queryKey: ["rankings"],
    queryFn: () => api.getRankings(),
  });

  // Today's games query
  const {
    data: todaysGamesData,
    isLoading: gamesLoading,
    error: gamesError,
  } = useQuery({
    queryKey: ["todaysGames"],
    queryFn: () => api.getTodaysGames(),
    retry: 1,
  });

  // Top skaters query
  const {
    data: topSkatersData,
    isLoading: topSkatersLoading,
    error: topSkatersError,
  } = useQuery({
    queryKey: ["topSkaters"],
    queryFn: () => api.getTopSkaters(10, 20242025, 3, 5),
  });

  // Sleepers query
  const {
    data: sleepersData,
    isLoading: sleepersLoading,
    error: sleepersError,
  } = useQuery({
    queryKey: ["sleepers"],
    queryFn: () => api.getSleepers(),
  });

  // Analysis date rankings query (using June 17, 2024)
  const {
    data: analysisDateRankings,
    isLoading: analysisDateRankingsLoading,
    error: analysisDateRankingsError,
  } = useQuery({
    queryKey: ["dailyRankings", analysisDateString],
    queryFn: () => api.getDailyFantasySummary(analysisDateString),
    retry: 1,
  });

  return {
    yesterdayDate: analysisDate, // Keep the old name for backwards compatibility
    rankings,
    rankingsLoading,
    rankingsError,
    todaysGamesData,
    gamesLoading,
    gamesError,
    topSkatersData,
    topSkatersLoading,
    topSkatersError,
    yesterdayRankings: analysisDateRankings, // Keep the old name for backwards compatibility
    yesterdayRankingsLoading: analysisDateRankingsLoading,
    yesterdayRankingsError: analysisDateRankingsError,
    yesterdayString: analysisDateString, // Keep the old name for backwards compatibility
    sleepersData,
    sleepersLoading,
    sleepersError,
  };
}
