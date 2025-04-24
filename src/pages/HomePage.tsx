import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

// Import components
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import GameCard from "../components/GameCard";
import RankingsTable from "../components/RankingsTable";
import TopSkaters from "../components/TopSkaters";

const HomePage = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState("rankings");

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
    retry: 1, // Only retry once to avoid excessive retries
  });

  const {
    data: topSkatersData,
    isLoading: topSkatersLoading,
    error: topSkatersError,
  } = useQuery({
    queryKey: ["topSkaters"],
    queryFn: () => api.getTopSkaters(),
  });

  // Function to render the games tab content
  const renderGamesTab = () => {
    if (gamesLoading) {
      return <LoadingSpinner message="Loading today's games..." />;
    }

    if (gamesError) {
      return <ErrorMessage message="Could not load today's games." />;
    }

    const games = todaysGamesData?.games || [];

    if (games.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center border border-gray-100">
          <p className="text-gray-500">No games scheduled for today.</p>
          <Link
            to="/games"
            className="inline-block mt-4 px-4 py-2 bg-[#6D4C9F] text-white rounded-md hover:bg-[#5A3A87] transition-colors"
          >
            View Games Calendar
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {games.map((game) => {
          // Format time string
          let timeString;
          try {
            const gameDate = new Date(game.start_time);
            timeString = gameDate.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });
          } catch (e) {
            timeString = "Time TBD";
          }

          // Get game status
          const gameStatus = game.game_state || "SCHEDULED";

          return (
            <GameCard
              key={game.id}
              game={game}
              timeString={timeString}
              gameStatus={gameStatus}
            />
          );
        })}
      </div>
    );
  };

  // Function to render the rankings tab content
  const renderRankingsTab = () => {
    if (rankingsLoading) {
      return <LoadingSpinner message="Loading rankings..." />;
    }

    if (rankingsError) {
      return <ErrorMessage message="Could not load rankings data." />;
    }

    return <RankingsTable rankings={rankings} />;
  };

  // Function to render the players tab content
  const renderPlayersTab = () => {
    if (topSkatersLoading) {
      return <LoadingSpinner message="Loading top players..." />;
    }

    if (topSkatersError) {
      return <ErrorMessage message="Could not load top players data." />;
    }

    return <TopSkaters data={topSkatersData} isLoading={false} error={null} />;
  };

  // Loading state for summary stats
  const isLoadingSummary = gamesLoading || rankingsLoading;

  // Extract summary stats
  const gamesSummary = todaysGamesData?.summary || {
    total_games: 0,
    total_teams_playing: 0,
    team_players_count: [],
  };

  // Get most represented team
  const mostPlayersTeam =
    gamesSummary.team_players_count.length > 0
      ? gamesSummary.team_players_count[0].nhl_team
      : "N/A";

  // Get player count for that team
  const mostPlayersCount =
    gamesSummary.team_players_count.length > 0
      ? gamesSummary.team_players_count[0].player_count
      : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with stats */}
      <div className="bg-gradient-to-r from-[#041E42] to-[#6D4C9F] text-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">Fantasy NHL Dashboard</h1>
        <p className="text-lg opacity-90 mb-6">Todays Games overview:</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm opacity-80">Total Games</div>
            <div className="text-2xl font-bold">
              {isLoadingSummary ? (
                <div className="h-8 w-8 bg-white/20 rounded animate-pulse"></div>
              ) : (
                gamesSummary.total_games
              )}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm opacity-80">Teams Playing</div>
            <div className="text-2xl font-bold">
              {isLoadingSummary ? (
                <div className="h-8 w-8 bg-white/20 rounded animate-pulse"></div>
              ) : (
                gamesSummary.total_teams_playing
              )}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm opacity-80">Most Players</div>
            <div className="text-2xl font-bold">
              {isLoadingSummary ? (
                <div className="h-8 w-16 bg-white/20 rounded animate-pulse"></div>
              ) : (
                mostPlayersTeam
              )}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm opacity-80">Player Count</div>
            <div className="text-2xl font-bold">
              {isLoadingSummary ? (
                <div className="h-8 w-8 bg-white/20 rounded animate-pulse"></div>
              ) : (
                mostPlayersCount
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("rankings")}
            className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
              activeTab === "rankings"
                ? "border-[#6D4C9F] text-[#6D4C9F]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Rankings
          </button>
          <button
            onClick={() => setActiveTab("games")}
            className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
              activeTab === "games"
                ? "border-[#6D4C9F] text-[#6D4C9F]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Today's Games
          </button>
          <button
            onClick={() => setActiveTab("players")}
            className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
              activeTab === "players"
                ? "border-[#6D4C9F] text-[#6D4C9F]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Top Players
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="mb-8">
        {activeTab === "rankings" && renderRankingsTab()}
        {activeTab === "games" && renderGamesTab()}
        {activeTab === "players" && renderPlayersTab()}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link
          to="/teams"
          className="bg-[#6D4C9F] hover:bg-[#5A3A87] text-white py-3 px-4 rounded-md shadow-sm font-medium transition-colors text-center"
        >
          View All Teams
        </Link>
        <Link
          to="/games"
          className="bg-[#041E42] hover:bg-[#0A2D5A] text-white py-3 px-4 rounded-md shadow-sm font-medium transition-colors text-center"
        >
          Game Center
        </Link>
        <Link
          to="/rankings"
          className="bg-gradient-to-r from-[#AF1E2D] to-[#C8102E] hover:from-[#9A1B28] hover:to-[#B30E29] text-white py-3 px-4 rounded-md shadow-sm font-medium transition-colors text-center"
        >
          View Full Rankings
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
