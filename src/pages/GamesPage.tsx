import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import GameDaySummary from "../components/GameDaySummary";

// Helper to get status class
const getStatusClass = (status: string) => {
  switch (status) {
    case "LIVE":
      return "bg-red-100 text-red-800";
    case "FINAL":
    case "OFF":
      return "bg-gray-100 text-gray-800";
    case "SCHEDULED":
    case "PRE":
      return "bg-green-100 text-green-800";
    case "POSTPONED":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

// Format date for display
const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  };
  return date.toLocaleDateString("en-US", options);
};

const getTodayString = () => {
  return new Date().toISOString().split("T")[0];
};

const GamesPage = () => {
  // State for date selector
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString);

  // State for filters
  const [filterTeam, setFilterTeam] = useState<string>("all");

  // Fetch data for the selected date
  const {
    data: gamesData,
    isLoading: gamesLoading,
    error: gamesError,
    refetch: refetchGames,
  } = useQuery({
    queryKey: ["games", selectedDate],
    queryFn: () => {
      if (selectedDate === new Date().toISOString().split("T")[0]) {
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

  // Function to get team primary color (this could be expanded with your team colors data)
  const getTeamPrimaryColor = (teamName: string): string => {
    // This is a simplified version - you should expand this with your full team colors
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

  // Loading state
  if (gamesLoading && dailyRankingsLoading) {
    return <LoadingSpinner size="large" message="Loading games data..." />;
  }

  // Error handling
  if (gamesError && dailyRankingsError) {
    return (
      <div>
        <ErrorMessage message="Failed to load games data. Please try again." />
        <div className="mt-4">
          <button
            onClick={() => refetchGames()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!gamesData) {
    return (
      <ErrorMessage message="No game data available for the selected date." />
    );
  }

  const { games, summary } = gamesData;

  // Format the display date for UI
  const displayDate = new Date(selectedDate);
  const formattedDisplayDate = formatDate(displayDate);

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

  // Helper to calculate date range for the date picker
  const getDateRange = () => {
    const dates = [];
    const today = new Date();
    const todayString = today.toISOString().split("T")[0]; // Get consistent "today" string

    for (let i = -14; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateString = date.toISOString().split("T")[0];
      const isToday = dateString === todayString; // Compare strings instead of index

      dates.push({
        value: dateString,
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        isToday,
      });
    }

    return dates;
  };

  const dateRange = getDateRange();

  return (
    <div>
      {/* Date selector */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h2 className="text-xl font-medium mb-4 md:mb-0">
            {formattedDisplayDate}
          </h2>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const prevDate = new Date(selectedDate);
                prevDate.setDate(prevDate.getDate() - 1);
                setSelectedDate(prevDate.toISOString().split("T")[0]);
              }}
              className="p-2 rounded-md bg-gray-200 hover:bg-gray-300"
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
              className="p-2 border rounded-md"
            >
              {dateRange.map((date) => (
                <option key={date.value} value={date.value}>
                  {date.isToday ? `Today (${date.label})` : date.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                const nextDate = new Date(selectedDate);
                nextDate.setDate(nextDate.getDate() + 1);
                setSelectedDate(nextDate.toISOString().split("T")[0]);
              }}
              className="p-2 rounded-md bg-gray-200 hover:bg-gray-300"
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
              onClick={() =>
                setSelectedDate(new Date().toISOString().split("T")[0])
              }
              className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Today
            </button>
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
          <div className="text-sm text-gray-600">Most Players</div>
          <div className="text-2xl font-bold">
            {summary.team_players_count.length > 0
              ? summary.team_players_count[0].nhl_team
              : "N/A"}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">Player Count</div>
          <div className="text-2xl font-bold">
            {summary.team_players_count.length > 0
              ? summary.team_players_count[0].player_count
              : "0"}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterTeam === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
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
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setFilterTeam(team)}
            >
              {team}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Fantasy Scores */}
      <div className="mb-6">
        <GameDaySummary
          rankings={dailyRankings || []}
          isLoading={dailyRankingsLoading}
          error={dailyRankingsError}
        />
      </div>

      {/* Games list */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
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
                    className="w-3 flex-shrink-0"
                    style={{ backgroundColor: awayTeamColor }}
                  ></div>

                  {/* Main game content */}
                  <div className="flex-grow">
                    {/* Game header */}
                    <div className="bg-gray-100 p-3 flex items-center justify-between">
                      <div className="text-sm font-bold">{timeString}</div>
                      <div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(gameStatus)}`}
                        >
                          {gameStatus === "PRE" ? "SCHEDULED" : gameStatus}
                          {game.period && ` - ${game.period}`}
                        </span>
                      </div>
                    </div>

                    {/* Team matchup - NHL style */}
                    <div className="p-4">
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
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-bold">
                                  {game.away_team.substring(0, 3)}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="text-lg font-bold">
                                {game.away_team}
                              </div>
                              <div className="text-xs text-gray-500">
                                {game.series_status.topSeedTeamAbbrev ===
                                game.away_team.substring(0, 3)
                                  ? `${game.series_status.topSeedWins}-${game.series_status.bottomSeedWins}`
                                  : `${game.series_status.bottomSeedWins}-${game.series_status.topSeedWins}`}
                              </div>
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
                                <div className="mx-2 text-gray-400">-</div>
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
                                    className="text-gray-500 hover:text-blue-600 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Highlights
                                  </a>
                                  <span className="text-gray-300">|</span>
                                  <a
                                    href={`https://www.nhl.com/gamecenter/${game.id}/boxscore`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-blue-600 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Box Score
                                  </a>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-lg font-bold">VS</div>
                          )}
                          {gameStatus === "LIVE" && game.period && (
                            <div className="text-xs text-red-600 font-medium mt-1">
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
                              <div className="text-xs text-gray-500">
                                {game.series_status.topSeedTeamAbbrev ===
                                game.home_team.substring(0, 3)
                                  ? `${game.series_status.topSeedWins}-${game.series_status.bottomSeedWins}`
                                  : `${game.series_status.bottomSeedWins}-${game.series_status.topSeedWins}`}
                              </div>
                            </div>
                            {game.home_team_logo ? (
                              <img
                                src={game.home_team_logo}
                                alt={`${game.home_team} logo`}
                                className="w-12 h-12 ml-3"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center ml-3">
                                <span className="text-sm font-bold">
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
                    className="w-3 flex-shrink-0"
                    style={{ backgroundColor: homeTeamColor }}
                  ></div>
                </div>

                {/* Player information - Collapsible or in an accordion */}
                <div className="border-t">
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
                          <thead className="bg-gray-100">
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
                                  {player.fantasy_team}
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
                        <thead className="bg-gray-100">
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
                            <tr key={idx} className="border-t hover:bg-gray-50">
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
                                {player.fantasy_team}
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GamesPage;
