import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { usePlayoffsData } from "../hooks/usePlayoffsData";

import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import GameCard from "../components/GameCard";
import RankingsTable from "../components/RankingsTable";
import TopSkaters from "../components/TopSkaters";
import { getYesterdayString, dateStringToLocalDate } from "../utils/timezone";
import DailyRankingsCard from "../components/DailyRankingsCard";

import { toLocalDateString } from "../utils/timezone";
import { getTeamLogoUrl, getNHLTeamUrlSlug } from "../utils/nhlTeams";

const HomePage = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState("rankings");

  const { teamsInPlayoffs, isLoading: playoffsLoading } = usePlayoffsData();

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

  const {
    data: yesterdayRankings,
    isLoading: yesterdayRankingsLoading,
    error: yesterdayRankingsError,
  } = useQuery({
    queryKey: ["dailyRankings", yesterdayString],
    queryFn: () => api.getDailyFantasySummary(yesterdayString),
    retry: 1,
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
            to={`/games/${toLocalDateString(new Date())}`}
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
            const gameDate = new Date(game.startTime);
            timeString = gameDate.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });
          } catch (e) {
            timeString = "Time TBD";
          }

          // Get game status
          const gameStatus = game.gameState || "SCHEDULED";

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
    totalGames: 0,
    totalTeamsPlaying: 0,
    teamPlayersCount: [],
  };

  // Get most represented team
  const mostPlayersTeam =
    gamesSummary.teamPlayersCount.length > 0
      ? gamesSummary.teamPlayersCount[0].nhlTeam
      : "N/A";

  // Get player count for that team
  const mostPlayersCount =
    gamesSummary.teamPlayersCount.length > 0
      ? gamesSummary.teamPlayersCount[0].playerCount
      : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with stats - first row */}
      <div className="bg-gradient-to-r from-[#041E42] to-[#6D4C9F] text-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">Fantasy NHL Dashboard</h1>
        <p className="text-lg opacity-90 mb-6">Today's Games overview:</p>

        {/* First row - standard stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm opacity-80">Team with most bets</div>
            <div className="text-2xl font-bold">
              {isLoadingSummary ? (
                <div className="h-8 w-16 bg-white/20 rounded animate-pulse"></div>
              ) : (
                mostPlayersTeam
              )}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm opacity-80">
              Fantasy Teams with Players for today
            </div>
            <div className="text-2xl font-bold">
              {isLoadingSummary ? (
                <div className="h-8 w-8 bg-white/20 rounded animate-pulse"></div>
              ) : (
                mostPlayersCount
              )}
            </div>
          </div>
        </div>

        {/* Second row - playoff teams that takes full width */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="text-sm opacity-80 mb-3">Active Playoffs Teams</div>
          <div className="flex flex-wrap gap-3">
            {playoffsLoading ? (
              <div className="h-8 w-16 bg-white/20 rounded animate-pulse"></div>
            ) : (
              Array.from(teamsInPlayoffs).map((teamAbbrev) => {
                const teamLogo = getTeamLogoUrl(teamAbbrev);
                const url_slug = getNHLTeamUrlSlug(teamAbbrev);
                return (
                  <div
                    key={teamAbbrev}
                    className="bg-white/20 rounded-lg p-2 flex items-center justify-center"
                    title={teamAbbrev}
                  >
                    <a
                      href={`https://www.nhl.com/${url_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-col items-center group"
                    >
                      {teamLogo ? (
                        <img
                          src={teamLogo}
                          alt={teamAbbrev}
                          className="w-12 h-12 object-contain mb-1"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-1">
                          <span className="text-sm font-bold text-white">
                            {teamAbbrev}
                          </span>
                        </div>
                      )}
                      <span className="text-xs font-medium text-white">
                        {teamAbbrev}
                      </span>
                    </a>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

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
            Overall Ranking
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
            Top Skaters
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
          to={`/games/${toLocalDateString(new Date())}`}
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
