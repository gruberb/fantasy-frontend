import { useParams } from "react-router-dom";
import DatePickerHeader from "../components/common/DatePickerHeader";
import GameTabs from "../components/games/GameTabs";
import GamesTabContent from "../components/games/GamesTabContent";
import FantasyTeamSummary from "../components/fantasy/FantasyTeamSummary";
import AutoRefreshIndicator from "../components/games/AutoRefreshIndicator";
import { useGamesData } from "../hooks/useGamesData";

const GamesPage = () => {
  // Get date parameter from URL
  const { date: dateParam } = useParams<{ date?: string }>();

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

  return (
    <div>
      {/* Page header */}
      <DatePickerHeader
        title="Game Center"
        subtitle="Follow up on all match days, scores and the top skaters of the day."
        selectedDate={selectedDate}
        onDateChange={updateSelectedDate}
      />

      {/* Tab navigation */}
      <GameTabs activeTab={activeTab} setActiveTab={setActiveTab} />

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
