import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { getYesterdayString, dateStringToLocalDate } from "../utils/timezone";

import ErrorMessage from "../components/common/ErrorMessage";
import DailyRankingsCard from "../components/rankings/DailyRankingsCard";
import StatsSummary from "../components/home/StatsSummary";
import TabNavigation from "../components/home/TabNavigation";
import RankingsTab from "../components/home/RankingsTab";
import GamesTab from "../components/home/GamesTab";
import PlayersTab from "../components/home/PlayersTab";
import ActionButtons from "../components/home/ActionButtons";
import LoadingSpinner from "../components/common/LoadingSpinner";

const HomePage = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState("rankings");

  // Get yesterday's date string
  const yesterdayString = getYesterdayString();
  const yesterdayDate = dateStringToLocalDate(yesterdayString);

  // Fetch data for the dashboard
  const {
    data: rankings,
    isLoading: rankingsLoading,
    error: rankingsError,
  } = useQuery({
    queryKey: ["rankings"],
    queryFn: () => api.getRankings(),
  });

  const {
    data: todaysGamesData,
    isLoading: gamesLoading,
    error: gamesError,
  } = useQuery({
    queryKey: ["todaysGames"],
    queryFn: () => api.getTodaysGames(),
    retry: 1,
  });

  const {
    data: topSkatersData,
    isLoading: topSkatersLoading,
    error: topSkatersError,
  } = useQuery({
    queryKey: ["topSkaters"],
    queryFn: () => api.getTopSkaters(),
  });

  const {
    data: yesterdayRankings,
    isLoading: yesterdayRankingsLoading,
    error: yesterdayRankingsError,
  } = useQuery({
    queryKey: ["dailyRankings", yesterdayString],
    queryFn: () => api.getDailyFantasySummary(yesterdayString),
    retry: 1,
  });

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "rankings":
        return (
          <RankingsTab
            isLoading={rankingsLoading}
            error={rankingsError}
            rankings={rankings}
          />
        );
      case "games":
        return (
          <GamesTab
            isLoading={gamesLoading}
            error={gamesError}
            data={todaysGamesData}
          />
        );
      case "players":
        return (
          <PlayersTab
            isLoading={topSkatersLoading}
            error={topSkatersError}
            data={topSkatersData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with stats - first row */}
      <StatsSummary gamesData={todaysGamesData} isLoading={gamesLoading} />

      {/* Yesterday's Rankings Section */}
      <div className="mb-6">
        {yesterdayRankingsLoading ? (
          <LoadingSpinner message="Loading yesterday's rankings..." />
        ) : yesterdayRankingsError ? (
          <ErrorMessage message="Could not load yesterday's rankings." />
        ) : (
          <DailyRankingsCard
            rankings={yesterdayRankings || []}
            date={yesterdayDate}
            title="Yesterday's Rankings"
            limit={7}
          />
        )}
      </div>

      {/* Tab navigation */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab content */}
      <div className="mb-8">{renderTabContent()}</div>

      {/* Action buttons */}
      <ActionButtons />
    </div>
  );
};

export default HomePage;
