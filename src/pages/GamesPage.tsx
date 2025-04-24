import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import GameDaySummary from "../components/GameDaySummary";
import {
  toLocalDateString,
  dateStringToLocalDate,
  formatDisplayDate,
  isSameLocalDay,
} from "../utils/timezone";

// Helper to get status class
const getStatusClass = (status: string) => {
  switch (status) {
    case "LIVE":
      return "bg-red-100 text-red-800 border border-red-200";
    case "FINAL":
    case "OFF":
      return "bg-gray-100 text-gray-800 border border-gray-200";
    case "SCHEDULED":
    case "PRE":
      return "bg-green-100 text-green-800 border border-green-200";
    case "POSTPONED":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    default:
      return "bg-blue-100 text-blue-800 border border-blue-200";
  }
};

const GamesPage = () => {
  // State for date selector - using simple YYYY-MM-DD string format
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    // Return YYYY-MM-DD in **local** time
    return toLocalDateString(today);
  });

  // State for filters
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [expandedGame, setExpandedGame] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  // Auto-refresh for live games
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (autoRefresh) {
      intervalId = setInterval(() => {
        // Only refetch if we're on today's date
        if (isSameLocalDay(dateStringToLocalDate(selectedDate), new Date())) {
          refetchGames();
        }
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, selectedDate]);

  // Fetch data for the selected date
  const {
    data: gamesData,
    isLoading: gamesLoading,
    error: gamesError,
    refetch: refetchGames,
  } = useQuery({
    queryKey: ["games", selectedDate],
    queryFn: () => {
      if (isSameLocalDay(dateStringToLocalDate(selectedDate), new Date())) {
        return api.getTodaysGames();
      }
      return api.getGames(selectedDate);
    },
    retry: 1,
  });

  // Fetch daily fantasy rankings for the selected date
  const {
    data: dailyRankings,
    isLoading: dailyRankingsLoading,
    error: dailyRankingsError,
  } = useQuery({
    queryKey: ["dailyRankings", selectedDate],
    queryFn: () => api.getDailyFantasySummary(selectedDate),
    retry: 1,
  });

  // Function to get team primary color
  const getTeamPrimaryColor = (teamName: string): string => {
    const teamColors: Record<string, string> = {
      ANA: "#F47A38", // Anaheim Ducks
      ARI: "#8C2633", // Arizona Coyotes
      BOS: "#FFB81C", // Boston Bruins
      BUF: "#002654", // Buffalo Sabres
      CGY: "#C8102E", // Calgary Flames
      CAR: "#CC0000", // Carolina Hurricanes
      CHI: "#CF0A2C", // Chicago Blackhawks
      COL: "#6F263D", // Colorado Avalanche
      CBJ: "#002654", // Columbus Blue Jackets
      DAL: "#006847", // Dallas Stars
      DET: "#CE1126", // Detroit Red Wings
      EDM: "#FF4C00", // Edmonton Oilers
      FLA: "#C8102E", // Florida Panthers
      LAK: "#111111", // Los Angeles Kings
      MIN: "#154734", // Minnesota Wild
      MTL: "#AF1E2D", // Montreal Canadiens
      NSH: "#FFB81C", // Nashville Predators
      NJD: "#CE1126", // New Jersey Devils
      NYI: "#00539B", // New York Islanders
      NYR: "#0038A8", // New York Rangers
      OTT: "#C52032", // Ottawa Senators
      PHI: "#F74902", // Philadelphia Flyers
      PIT: "#FFB81C", // Pittsburgh Penguins
      SJS: "#006D75", // San Jose Sharks
      SEA: "#99D9D9", // Seattle Kraken
      STL: "#002F87", // St. Louis Blues
      TBL: "#002868", // Tampa Bay Lightning
      TOR: "#00205B", // Toronto Maple Leafs
      VAN: "#00205B", // Vancouver Canucks
      VGK: "#B4975A", // Vegas Golden Knights
      WSH: "#C8102E", // Washington Capitals
      WPG: "#041E42", // Winnipeg Jets
    };

    // Try to find the team by looking for partial matches
    for (const [key, color] of Object.entries(teamColors)) {
      if (teamName.includes(key)) {
        return color;
      }
    }

    // Default color if team not found
    return "#041E42"; // NHL blue
  };

  const addDaysToDateString = (dateString: string, days: number): string => {
    const date = dateStringToLocalDate(dateString); // get local date
    date.setDate(date.getDate() + days); // add (or subtract) days in local time
    return toLocalDateString(date); // convert back to YYYY-MM-DD
  };

  const removeDaysFromString = (dateString: string, days: number): string => {
    const date = dateStringToLocalDate(dateString); // get local date
    date.setDate(date.getDate() - days); // add (or subtract) days in local time
    return toLocalDateString(date); // convert back to YYYY-MM-DD
  };

  // Build date range for the date picker
  const getDateRange = () => {
    const dates = [];
    const today = new Date(); // local
    for (let i = -14; i <= 0; i++) {
      // Create a local date offset by i days from 'today'
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Convert to local YYYY-MM-DD
      const dateString = toLocalDateString(date);

      const isToday = i === 0;
      const isYesterday = i === -1;

      dates.push({
        value: dateString,
        label: isToday
          ? "Today"
          : isYesterday
            ? "Yesterday"
            : toLocalDateString(date),
        isToday,
        isYesterday,
      });
    }
    return dates;
  };

  const dateRange = getDateRange();

  // Format date for display
  const formattedDisplayDate = formatDisplayDate(
    dateStringToLocalDate(selectedDate),
  );

  // Check if any games are live
  const hasLiveGames =
    gamesData?.games.some(
      (game) => (game.game_state || "").toUpperCase() === "LIVE",
    ) || false;

  // Loading state
  if (gamesLoading && dailyRankingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" message="Loading games data..." />
      </div>
    );
  }

  // Error handling
  if (gamesError && dailyRankingsError) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <ErrorMessage message="Failed to load games data. Please try again." />
        <div className="mt-4">
          <button
            onClick={() => refetchGames()}
            className="px-4 py-2 bg-[#6D4C9F] text-white rounded-md hover:bg-[#5A3A87] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!gamesData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <ErrorMessage message="No game data available for the selected date." />
      </div>
    );
  }

  const { games, summary } = gamesData;

  // Get unique NHL teams playing on this date
  const teamsPlaying = summary.team_players_count.map((t) => t.nhl_team);

  // Filter games by selected team
  const filteredGames =
    filterTeam === "all"
      ? games
      : games.filter(
          (game) =>
            game.home_team === filterTeam || game.away_team === filterTeam,
        );

  return (
    <div>
      {/* Page header */}
      <div className="bg-gradient-to-r from-[#041E42] to-[#6D4C9F] text-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2 pb-2">Game Center</h1>
        <p className="text-lg opacity-90 mb-4">
          Follow up on all match days, scores and the top players of the day.
        </p>
        <div className="bg-white/10 p-2 m-2 rounded-lg shadow-sm mb-6 border border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Date header */}
            <h2 className="text-lg md:text-xl font-medium mb-4 md:mb-0">
              {formattedDisplayDate}
            </h2>
            {/* Date controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const prevDate = removeDaysFromString(selectedDate, 1);
                  setSelectedDate(prevDate);
                }}
                className="p-1 md:p-2 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Previous day"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-1 md:p-2 bg-white/10 border border-white/20 rounded-md text-center text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                {dateRange.map((date) => (
                  <option key={date.value} value={date.value}>
                    {date.isToday ? `Today` : date.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  const nextDate = addDaysToDateString(selectedDate, 1);
                  setSelectedDate(nextDate);
                }}
                className="p-1 md:p-2 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Next day"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <button
                onClick={() => setSelectedDate(toLocalDateString(new Date()))}
                className="ml-2 px-2 md:px-3 py-1 md:py-2 bg-white/10 border border-white/20 text-white rounded-md hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                Today
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">Total Games</div>
          <div className="text-2xl font-bold">{summary.total_games}</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">Teams Playing</div>
          <div className="text-2xl font-bold">
            {summary.total_teams_playing}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">Team with most bets</div>
          <div className="text-2xl font-bold">
            {summary.team_players_count.length > 0
              ? summary.team_players_count[0].nhl_team
              : "N/A"}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">
            Fantasy Teams involved today
          </div>
          <div className="text-2xl font-bold">
            {summary.team_players_count.length > 0
              ? summary.team_players_count[0].player_count
              : "0"}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col space-y-4">
          {/* Team filters */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Filter by NHL Team
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filterTeam === "all"
                    ? "bg-[#6D4C9F] text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
                onClick={() => setFilterTeam("all")}
              >
                All Teams
              </button>

              {teamsPlaying.map((team) => (
                <button
                  key={team}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filterTeam === team
                      ? "bg-[#6D4C9F] text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                  onClick={() => setFilterTeam(team)}
                >
                  {team}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Live update toggle */}
            {hasLiveGames && selectedDate === toLocalDateString(new Date()) && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="autoRefresh" className="text-sm text-gray-700">
                  Auto-refresh live games
                </label>
                {autoRefresh && (
                  <div
                    className="ml-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"
                    title="Refreshing every 30 seconds"
                  ></div>
                )}
              </div>
            )}

            {/* Manual refresh button */}
            <button
              onClick={() => refetchGames()}
              className="ml-auto px-3 py-1 bg-[#6D4C9F]/10 text-[#6D4C9F] rounded hover:bg-[#6D4C9F]/20 flex items-center"
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
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Daily Fantasy Scores */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Fantasy Scores</h2>
        <GameDaySummary
          rankings={dailyRankings || []}
          isLoading={dailyRankingsLoading}
          error={dailyRankingsError}
        />
      </div>

      {/* Games list */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Game Schedule</h2>

          {/* Game status indicators */}
          <div className="flex gap-2 items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200 mr-1"></div>
              <span className="text-xs text-gray-500">Scheduled</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200 animate-pulse mr-1"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200 mr-1"></div>
              <span className="text-xs text-gray-500">Final</span>
            </div>
          </div>
        </div>

        {filteredGames.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">
              No games scheduled for this date with the selected filters.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredGames.map((game) => {
              let timeString;
              try {
                // Just use the ISO date directly
                const gameDate = new Date(game.start_time);
                timeString = gameDate.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });
              } catch (e) {
                timeString = "Time TBD";
              }

              // Game status
              const gameStatus = game.game_state || "SCHEDULED";

              // Check if game is complete
              const isGameComplete =
                gameStatus === "FINAL" || gameStatus === "OFF";

              // Get team colors
              const awayTeamColor = getTeamPrimaryColor(game.away_team);
              const homeTeamColor = getTeamPrimaryColor(game.home_team);

              return (
                <div
                  key={game.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  {/* NHL-style game card with team colors on sides */}
                  <div className="flex">
                    {/* Left team color bar */}
                    <div
                      className="w-2 flex-shrink-0"
                      style={{ backgroundColor: awayTeamColor }}
                    ></div>

                    {/* Main game content */}
                    <div className="flex-grow">
                      {/* Game header */}
                      <div className="bg-gray-50 p-3 flex items-center justify-between border-b border-gray-100">
                        <div className="text-sm font-bold">{timeString}</div>
                        <div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusClass(gameStatus)}`}
                          >
                            {gameStatus === "PRE" ? "SCHEDULED" : gameStatus}
                            {game.period && ` • ${game.period}`}
                          </span>
                        </div>
                      </div>

                      {/* Team matchup - NHL style */}
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          window.open(
                            `https://www.nhl.com/gamecenter/${game.id}`,
                            "_blank",
                          )
                        }
                      >
                        <div className="flex items-center">
                          {/* Away team */}
                          <div className="flex-1">
                            <div className="flex items-center">
                              {game.away_team_logo ? (
                                <img
                                  src={game.away_team_logo}
                                  alt={`${game.away_team} logo`}
                                  className="w-12 h-12 mr-3"
                                />
                              ) : (
                                <div
                                  className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
                                  style={{
                                    backgroundColor: `${awayTeamColor}20`,
                                  }}
                                >
                                  <span
                                    className="text-sm font-bold"
                                    style={{ color: awayTeamColor }}
                                  >
                                    {game.away_team.substring(0, 3)}
                                  </span>
                                </div>
                              )}
                              <div>
                                <div className="text-lg font-bold">
                                  {game.away_team}
                                </div>
                                {game.series_status &&
                                  game.series_status.topSeedTeamAbbrev && (
                                    <div className="text-xs text-gray-500">
                                      {game.series_status.topSeedTeamAbbrev ===
                                      game.away_team.substring(0, 3)
                                        ? `${game.series_status.topSeedWins}-${game.series_status.bottomSeedWins}`
                                        : `${game.series_status.bottomSeedWins}-${game.series_status.topSeedWins}`}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="px-4 text-center flex flex-col">
                            {game.away_score !== undefined &&
                            game.away_score !== null &&
                            game.home_score !== undefined &&
                            game.home_score !== null ? (
                              <>
                                <div className="flex items-center justify-center">
                                  <div className="text-3xl font-bold">
                                    {game.away_score}
                                  </div>
                                  <div className="mx-2 text-gray-300">-</div>
                                  <div className="text-3xl font-bold">
                                    {game.home_score}
                                  </div>
                                </div>

                                {/* Subtle text links for completed games - properly positioned underneath */}
                                {isGameComplete && (
                                  <div className="mt-1 text-xs flex justify-center space-x-3">
                                    <a
                                      href={`https://www.nhl.com/gamecenter/${game.id}/recap`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-gray-500 hover:text-[#6D4C9F] hover:underline flex items-center"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <svg
                                        className="w-3 h-3 mr-1"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                      >
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                      Highlights
                                    </a>
                                    <span className="text-gray-300">|</span>
                                    <a
                                      href={`https://www.nhl.com/gamecenter/${game.id}/boxscore`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-gray-500 hover:text-[#6D4C9F] hover:underline flex items-center"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <svg
                                        className="w-3 h-3 mr-1"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                      >
                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                                        <path d="M7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z" />
                                      </svg>
                                      Box Score
                                    </a>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-lg font-bold text-gray-400">
                                VS
                              </div>
                            )}
                            {gameStatus === "LIVE" && game.period && (
                              <div className="text-xs text-red-600 font-bold mt-1 animate-pulse">
                                {game.period}
                              </div>
                            )}
                          </div>

                          {/* Home team */}
                          <div className="flex-1 text-right">
                            <div className="flex items-center justify-end">
                              <div className="text-right">
                                <div className="text-lg font-bold">
                                  {game.home_team}
                                </div>
                                {game.series_status &&
                                  game.series_status.topSeedTeamAbbrev && (
                                    <div className="text-xs text-gray-500">
                                      {game.series_status.topSeedTeamAbbrev ===
                                      game.home_team.substring(0, 3)
                                        ? `${game.series_status.topSeedWins}-${game.series_status.bottomSeedWins}`
                                        : `${game.series_status.bottomSeedWins}-${game.series_status.topSeedWins}`}
                                    </div>
                                  )}
                              </div>
                              {game.home_team_logo ? (
                                <img
                                  src={game.home_team_logo}
                                  alt={`${game.home_team} logo`}
                                  className="w-12 h-12 ml-3"
                                />
                              ) : (
                                <div
                                  className="w-12 h-12 rounded-full flex items-center justify-center ml-3"
                                  style={{
                                    backgroundColor: `${homeTeamColor}20`,
                                  }}
                                >
                                  <span
                                    className="text-sm font-bold"
                                    style={{ color: homeTeamColor }}
                                  >
                                    {game.home_team.substring(0, 3)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right team color bar */}
                    <div
                      className="w-2 flex-shrink-0"
                      style={{ backgroundColor: homeTeamColor }}
                    ></div>
                  </div>

                  {/* Player information - Collapsible or in an accordion */}
                  <div className="border-t">
                    <button
                      className="w-full py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                      onClick={() =>
                        setExpandedGame(
                          expandedGame === game.id ? null : game.id,
                        )
                      }
                    >
                      <span>
                        {expandedGame === game.id ? "Hide" : "Show"} Player
                        Details
                      </span>
                      <svg
                        className={`ml-2 h-5 w-5 transform ${expandedGame === game.id ? "rotate-180" : ""} transition-transform duration-200`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Collapsible content */}
                    {expandedGame === game.id && (
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Away team players */}
                        <div>
                          <h3 className="font-bold text-md mb-2 flex items-center">
                            <div
                              className="w-3 h-3 mr-2"
                              style={{ backgroundColor: awayTeamColor }}
                            ></div>
                            {game.away_team} Players
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="py-1 px-2 text-left text-xs">
                                    Player
                                  </th>
                                  <th className="py-1 px-2 text-left text-xs">
                                    Fantasy Team
                                  </th>
                                  <th className="py-1 px-2 text-left text-xs">
                                    Points
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {game.away_team_players.map((player, idx) => (
                                  <tr
                                    key={idx}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    <td className="py-1 px-2">
                                      <div className="flex items-center">
                                        {player.image_url ? (
                                          <img
                                            src={player.image_url}
                                            alt={player.player_name || ""}
                                            className="w-6 h-6 rounded-full mr-2"
                                          />
                                        ) : (
                                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                                            <span className="text-xs font-medium">
                                              {(
                                                player.player_name ||
                                                player.name ||
                                                ""
                                              )
                                                .substring(0, 2)
                                                .toUpperCase()}
                                            </span>
                                          </div>
                                        )}
                                        <span className="text-xs">
                                          {player.player_name || player.name}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-1 px-2 text-xs">
                                      {player.fantasy_team ? (
                                        <Link
                                          to={`/teams/${player.fantasy_team_id}`}
                                          className="text-[#6D4C9F] hover:underline"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {player.fantasy_team}
                                        </Link>
                                      ) : (
                                        <span className="text-gray-400">—</span>
                                      )}
                                    </td>
                                    <td className="py-1 px-2 text-xs font-medium">
                                      {player.points || 0}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Home team players */}
                        <div>
                          <h3 className="font-bold text-md mb-2 flex items-center">
                            <div
                              className="w-3 h-3 mr-2"
                              style={{ backgroundColor: homeTeamColor }}
                            ></div>
                            {game.home_team} Players
                          </h3>
                          <table className="min-w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="py-1 px-2 text-left text-xs">
                                  Player
                                </th>
                                <th className="py-1 px-2 text-left text-xs">
                                  Fantasy Team
                                </th>
                                <th className="py-1 px-2 text-left text-xs">
                                  Points
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {game.home_team_players.map((player, idx) => (
                                <tr
                                  key={idx}
                                  className="border-t hover:bg-gray-50"
                                >
                                  <td className="py-1 px-2">
                                    <div className="flex items-center">
                                      {player.image_url ? (
                                        <img
                                          src={player.image_url}
                                          alt={player.player_name || ""}
                                          className="w-6 h-6 rounded-full mr-2"
                                        />
                                      ) : (
                                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                                          <span className="text-xs font-medium">
                                            {(
                                              player.player_name ||
                                              player.name ||
                                              ""
                                            )
                                              .substring(0, 2)
                                              .toUpperCase()}
                                          </span>
                                        </div>
                                      )}
                                      <span className="text-xs">
                                        {player.player_name || player.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-1 px-2 text-xs">
                                    {player.fantasy_team ? (
                                      <Link
                                        to={`/teams/${player.fantasy_team_id}`}
                                        className="text-[#6D4C9F] hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {player.fantasy_team}
                                      </Link>
                                    ) : (
                                      <span className="text-gray-400">—</span>
                                    )}
                                  </td>
                                  <td className="py-1 px-2 text-xs font-medium">
                                    {player.points || 0}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Auto-refresh status indicator */}
      {autoRefresh && (
        <div className="fixed bottom-4 right-4 bg-[#6D4C9F] text-white py-2 px-4 rounded-full shadow-lg flex items-center text-sm animate-pulse">
          <svg
            className="w-4 h-4 mr-2 animate-spin"
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
          Live Updates Active
        </div>
      )}
    </div>
  );
};

export default GamesPage;
