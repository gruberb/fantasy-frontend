// pages/GamesPage.tsx
import { useParams, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import DateHeader from "../components/common/DateHeader";
import GameTabs from "../components/games/GameTabs";
import GameCard from "../components/games/GameCard";
import FantasyTeamSummary from "../components/games/FantasyTeamSummary";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import { useGamesData } from "../hooks/useGamesData";

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
    <div className="space-y-4">
      {/* Compact date selector - positioned at the top */}
      <DateHeader
        selectedDate={selectedDate}
        onDateChange={updateSelectedDate}
        isFloating={true}
      />

      {/* Tab navigation */}
      <GameTabs activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Content container */}
      {activeTab === "games" ? (
        <GamesContent
          filteredGames={filteredGames}
          isLoading={gamesLoading}
          error={gamesError}
          expandedGames={expandedGames}
          toggleGameExpansion={toggleGameExpansion}
          onRefresh={refetchGames}
          getTeamPrimaryColor={getTeamPrimaryColor}
          hasLiveGames={hasLiveGames}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
          selectedDate={selectedDate}
        />
      ) : (
        <FantasyTeamSummary
          selectedDate={selectedDate}
          onRefresh={refetchGames}
        />
      )}
    </div>
  );
};

// Separate component for Games tab content
interface GamesContentProps {
  filteredGames: any[];
  isLoading: boolean;
  error: unknown;
  expandedGames: Set<number>;
  toggleGameExpansion: (gameId: number) => void;
  onRefresh: () => void;
  getTeamPrimaryColor: (teamName: string) => string;
  hasLiveGames: boolean;
  autoRefresh: boolean;
  setAutoRefresh: (value: boolean) => void;
  selectedDate: string;
}

const GamesContent = ({
  filteredGames,
  isLoading,
  error,
  expandedGames,
  toggleGameExpansion,
  onRefresh,
  getTeamPrimaryColor,
  hasLiveGames,
  autoRefresh,
  setAutoRefresh,
  selectedDate,
}: GamesContentProps) => {
  // Format date for display
  const formattedDate = new Date(selectedDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <LoadingSpinner size="large" message="Loading games data..." />
      </div>
    );
  }

  // Error handling
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <ErrorMessage
          message="Failed to load games data. Please try again."
          onRetry={onRefresh}
        />
      </div>
    );
  }

  // No games check
  if (!filteredGames || filteredGames.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
        <svg
          className="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9.172 16.172a4 4 0 015.656 0M12 14a2 2 0 100-4 2 2 0 000 4z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-gray-500">
          No game data available for the selected date.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Game Schedule Header - Now matches the ranking table style */}
      <div className="ranking-table-container overflow-hidden transition-all duration-300">
        <div className="ranking-table-header p-5 border-b border-gray-100 bg-gradient-to-r from-[#041E42]/95 to-[#6D4C9F]/95 text-white">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold mb-1">Game Schedule</h2>
              <span className="bg-yellow-300/20 text-yellow-300 text-xs px-3 py-1 rounded-full font-medium">
                {formattedDate}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hasLiveGames && (
                <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-md text-sm border border-white/20">
                  <input
                    type="checkbox"
                    id="autoRefresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="mr-2"
                  />
                  <label
                    htmlFor="autoRefresh"
                    className="text-white flex items-center text-sm"
                  >
                    Auto-refresh
                    {autoRefresh && (
                      <span
                        className="ml-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"
                        title="Refreshing every 30 seconds"
                      ></span>
                    )}
                  </label>
                </div>
              )}

              <button
                onClick={onRefresh}
                className="px-3 py-1.5 bg-white/10 text-white rounded-md hover:bg-white/20 flex items-center text-sm transition-colors border border-white/20"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Cards */}
      <div className="space-y-4">
        {filteredGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            isExpanded={expandedGames.has(game.id)}
            onToggleExpand={() => toggleGameExpansion(game.id)}
            getTeamPrimaryColor={getTeamPrimaryColor}
          />
        ))}
      </div>
    </div>
  );
};

export default GamesPage;
