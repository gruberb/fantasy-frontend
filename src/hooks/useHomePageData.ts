// src/hooks/useHomePageData.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { getYesterdayString } from "../utils/timezone";

export function useHomePageData() {
  // Yesterday's date for rankings
  const yesterdayString = getYesterdayString();

  // Rankings query
  const rankings = useQuery({
    queryKey: ["rankings"],
    queryFn: () => api.getRankings(),
  });

  // Today's games query
  const todaysGames = useQuery({
    queryKey: ["todaysGames"],
    queryFn: () => api.getTodaysGames(),
    retry: 1,
  });

  // Top skaters query
  const topSkaters = useQuery({
    queryKey: ["topSkaters"],
    queryFn: () => api.getTopSkaters(),
  });

  // Yesterday's rankings query
  const yesterdayRankings = useQuery({
    queryKey: ["dailyRankings", yesterdayString],
    queryFn: () => api.getDailyFantasySummary(yesterdayString),
    retry: 1,
  });

  return {
    rankings,
    todaysGames,
    topSkaters,
    yesterdayRankings,
    yesterdayString,
  };
}
