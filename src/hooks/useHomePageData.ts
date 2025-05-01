import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { getYesterdayString, dateStringToLocalDate } from "../utils/timezone";

export function useHomePageData() {
  // Yesterday's date for rankings
  const yesterdayString = getYesterdayString();
  const yesterdayDate = dateStringToLocalDate(yesterdayString);

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

  // Yesterday's rankings query
  const {
    data: yesterdayRankings,
    isLoading: yesterdayRankingsLoading,
    error: yesterdayRankingsError,
  } = useQuery({
    queryKey: ["dailyRankings", yesterdayString],
    queryFn: () => api.getDailyFantasySummary(yesterdayString),
    retry: 1,
  });

  return {
    yesterdayDate,
    rankings,
    rankingsLoading,
    rankingsError,
    todaysGamesData,
    gamesLoading,
    gamesError,
    topSkatersData,
    topSkatersLoading,
    topSkatersError,
    yesterdayRankings,
    yesterdayRankingsLoading,
    yesterdayRankingsError,
    yesterdayString,
  };
}
