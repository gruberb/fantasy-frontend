import { useState } from "react";

import ErrorMessage from "../components/common/ErrorMessage";
import DailyRankingsCard from "../components/rankings/DailyRankingsCard";
import StatsSummary from "../components/home/StatsSummary";
import TabNavigation from "../components/home/TabNavigation";
import RankingsTab from "../components/home/RankingsTab";
import GamesTab from "../components/home/GamesTab";
import PlayersTab from "../components/home/PlayersTab";
import ActionButtons from "../components/home/ActionButtons";
import LoadingSpinner from "../components/common/LoadingSpinner";

import { useHomePageData } from "../hooks/useHomePageData";

const HomePage = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState("rankings");

  const {
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
  } = useHomePageData();

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
    <div>
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
