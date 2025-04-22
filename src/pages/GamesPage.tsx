import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

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
  };
  return date.toLocaleDateString("en-US", options);
};

const GamesPage = () => {
  // State for date selector
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  });

  // State for filters
  const [filterTeam, setFilterTeam] = useState<string>("all");

  // Fetch data for the selected date
  const {
    data: gamesData,
    isLoading: gamesLoading,
    error: gamesError,
    refetch,
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

  // Loading state
  if (gamesLoading) {
    return <LoadingSpinner size="large" message="Loading games data..." />;
  }

  // Error handling
  if (gamesError) {
    return (
      <div>
        <ErrorMessage message="Failed to load games data. Please try again." />
        <div className="mt-4">
          <button
            onClick={() => refetch()}
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

  const { date, games, summary } = gamesData;

  // Format the display date for UI - add one day to match what's expected
  const displayDate = new Date(selectedDate);
  displayDate.setDate(displayDate.getDate() + 1); // Add one day
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

    // Add dates from 14 days ago to 14 days ahead
    for (let i = -14; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateString = date.toISOString().split("T")[0];
      const isToday = i === 0;

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
      <h1 className="text-3xl font-bold mb-6">NHL Games</h1>

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
            // Parse and format time in 12-hour format
            let timeString;
            try {
              // For UTC format like "23:00 UTC"
              if (game.start_time.includes("UTC")) {
                const timeStr = game.start_time.replace(" UTC", "");
                const [hours, minutes] = timeStr.split(":").map(Number);

                const gameDate = new Date(selectedDate);
                gameDate.setUTCHours(hours, minutes);

                timeString = gameDate.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });
              } else {
                // For ISO format
                const startTime = new Date(game.start_time);
                timeString = startTime.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });
              }
            } catch (e) {
              timeString = "Time TBD";
            }

            // Game status
            const gameStatus = game.game_state || "SCHEDULED";

            return (
              <div
                key={game.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Game header */}
                <div className="bg-gray-50 p-4 flex justify-between items-center">
                  <div>
                    <div className="font-bold">{timeString}</div>
                    <div className="text-sm text-gray-500">{game.venue}</div>
                  </div>

                  <div className="flex items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(gameStatus)}`}
                    >
                      {gameStatus === "PRE" ? "SCHEDULED" : gameStatus}
                      {game.period && ` - ${game.period}`}
                    </span>
                  </div>
                </div>

                {/* Game matchup section with scores */}
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Away team */}
                    <div className="flex flex-col items-center">
                      <div className="text-center">
                        {game.away_team_logo ? (
                          <img
                            src={game.away_team_logo}
                            alt={`${game.away_team} logo`}
                            className="w-16 h-16 mx-auto"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-full mx-auto">
                            <span className="text-xl font-bold text-gray-500">
                              {game.away_team}
                            </span>
                          </div>
                        )}
                        <div className="font-bold mt-2">{game.away_team}</div>
                        {/* Display game score */}
                        {game.away_score !== undefined &&
                          game.away_score !== null && (
                            <div className="text-2xl font-bold mt-1">
                              {game.away_score}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* VS */}
                    <div className="flex items-center justify-center">
                      <div className="text-xl font-bold text-gray-400">@</div>
                    </div>

                    {/* Home team */}
                    <div className="flex flex-col items-center">
                      <div className="text-center">
                        {game.home_team_logo ? (
                          <img
                            src={game.home_team_logo}
                            alt={`${game.home_team} logo`}
                            className="w-16 h-16 mx-auto"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-full mx-auto">
                            <span className="text-xl font-bold text-gray-500">
                              {game.home_team}
                            </span>
                          </div>
                        )}
                        <div className="font-bold mt-2">{game.home_team}</div>
                        {/* Display game score */}
                        {game.home_score !== undefined &&
                          game.home_score !== null && (
                            <div className="text-2xl font-bold mt-1">
                              {game.home_score}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Player information */}
                  <div className="mt-6 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Away team players */}
                    <div>
                      <h3 className="font-bold text-lg mb-2">
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
                                        className="w-8 h-8 rounded-full mr-2"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
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
                                    <span className="text-sm">
                                      {player.player_name || player.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-1 px-2 text-sm">
                                  {player.fantasy_team}
                                </td>
                                <td className="py-1 px-2 text-sm font-medium">
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
                      <h3 className="font-bold text-lg mb-2">
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
                                      className="w-8 h-8 rounded-full mr-2"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
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
                                  <span className="text-sm">
                                    {player.player_name || player.name}
                                  </span>
                                </div>
                              </td>
                              <td className="py-1 px-2 text-sm">
                                {player.fantasy_team}
                              </td>
                              <td className="py-1 px-2 text-sm font-medium">
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
