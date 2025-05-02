import { useParams, useSearchParams } from "react-router-dom";
import DatePickerHeader from "../components/common/DatePickerHeader";
import GameTabs from "../components/games/GameTabs";
import GamesTabContent from "../components/games/GamesTabContent";
import FantasyTeamSummary from "../components/fantasy/FantasyTeamSummary";
import AutoRefreshIndicator from "../components/games/AutoRefreshIndicator";
import { useGamesData } from "../hooks/useGamesData";
import { useEffect } from "react";

const GamesPage = () => {
  // Get date parameter from URL
  const { date: dateParam } = useParams<{ date?: string }>();
  // Use search params to get tab
  const [searchParams, setSearchParams] = useSearchParams();

  // Use the custom hook to manage games data and state
  const {
    selectedDate,
    updateSelectedDate,
    activeTab,
    setActiveTab,
    filteredGames,
    gamesLoading,
    gamesError,
    refetchGames,
    expandedGames,
    toggleGameExpansion,
    autoRefresh,
    setAutoRefresh,
    hasLiveGames,
    getTeamPrimaryColor,
  } = useGamesData(dateParam);

  // Set active tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "fantasy" || tabParam === "games") {
      setActiveTab(tabParam);
    }
  }, [searchParams, setActiveTab]);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    searchParams.set("tab", tab);
    setSearchParams(searchParams);
  };

  return (
    <div>
      {/* Page header */}
      <DatePickerHeader
        title="Game Center"
        subtitle="Follow up on all match days, scores and the top players of the day."
        selectedDate={selectedDate}
        onDateChange={updateSelectedDate}
      />

      {/* Tab navigation - use the new handler */}
      <GameTabs activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Tab content */}
      <div className="mb-8">
        {activeTab === "games" && (
          <GamesTabContent
            filteredGames={filteredGames}
            isLoading={gamesLoading}
            error={gamesError}
            hasLiveGames={hasLiveGames}
            autoRefresh={autoRefresh}
            setAutoRefresh={setAutoRefresh}
            onRefresh={refetchGames}
            expandedGames={expandedGames}
            toggleGameExpansion={toggleGameExpansion}
            getTeamPrimaryColor={getTeamPrimaryColor}
          />
        )}
        {activeTab === "fantasy" && (
          <FantasyTeamSummary selectedDate={selectedDate} />
        )}
      </div>

      {/* Auto-refresh status indicator */}
      <AutoRefreshIndicator autoRefresh={autoRefresh} />
    </div>
  );
};

export default GamesPage;
