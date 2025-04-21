import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
      return "bg-gray-100 text-gray-800";
    case "SCHEDULED":
      return "bg-green-100 text-green-800";
    case "POSTPONED":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

// Safe parse date function
const parseDate = (dateStr: string) => {
  try {
    // First try direct parsing
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // If it's in format like "23:00 UTC", parse it specially
    if (dateStr.includes("UTC")) {
      const today = new Date();
      const timeStr = dateStr.replace(" UTC", "");
      const [hours, minutes] = timeStr.split(":").map(Number);

      const dateWithTime = new Date(today);
      dateWithTime.setUTCHours(hours, minutes);
      return dateWithTime;
    }

    // Return today as fallback
    return new Date();
  } catch (e) {
    console.error("Failed to parse date:", dateStr);
    return new Date(); // Return today as fallback
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
  // State for filters
  const [filterTeam, setFilterTeam] = useState<string>("all");

  // Fetch data
  const { data: todaysGamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ["todaysGames"],
    queryFn: api.getTodaysGames,
  });

  // Loading state
  if (gamesLoading) {
    return <LoadingSpinner size="large" message="Loading games data..." />;
  }

  // Check if we have data
  if (!todaysGamesData || !todaysGamesData.games) {
    return (
      <ErrorMessage message="Failed to load games data. Please try again." />
    );
  }

  const { date, games, summary } = todaysGamesData;

  // Always use today's actual date
  const today = new Date();
  const displayDate = formatDate(today);

  // Get unique NHL teams playing today
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
      <h1 className="text-3xl font-bold mb-6">Today's NHL Games</h1>
      <p className="text-lg text-gray-600 mb-6">{displayDate}</p>

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
        <div className="text-center py-8">
          <p className="text-gray-500">No games match your filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGames.map((game) => {
            // Parse and format time in 12-hour format
            let timeString;
            try {
              const startTimeRaw = game.start_time.includes("UTC")
                ? game.start_time
                : parseDate(game.start_time);

              const startTime =
                typeof startTimeRaw === "string"
                  ? parseDate(startTimeRaw)
                  : startTimeRaw;

              timeString = startTime.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });
            } catch (e) {
              timeString = "Time TBD";
            }

            // Default game status
            const gameStatus = "SCHEDULED";

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
                      {gameStatus}
                    </span>
                  </div>
                </div>

                {/* Game matchup */}
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Away team */}
                    <div className="flex flex-col items-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-full mx-auto">
                          <span className="text-xl font-bold text-gray-500">
                            {game.away_team}
                          </span>
                        </div>
                        <div className="font-bold mt-2">{game.away_team}</div>
                      </div>
                    </div>

                    {/* VS */}
                    <div className="flex items-center justify-center">
                      <div className="text-xl font-bold text-gray-400">@</div>
                    </div>

                    {/* Home team */}
                    <div className="flex flex-col items-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-full mx-auto">
                          <span className="text-xl font-bold text-gray-500">
                            {game.home_team}
                          </span>
                        </div>
                        <div className="font-bold mt-2">{game.home_team}</div>
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
                                Position
                              </th>
                              <th className="py-1 px-2 text-left text-xs">
                                Fantasy Team
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {game.away_team_players.map((player, idx) => (
                              <tr
                                key={idx}
                                className="border-t hover:bg-gray-50"
                              >
                                <td className="py-1 px-2 text-sm">
                                  {player.player_name}
                                </td>
                                <td className="py-1 px-2 text-sm">
                                  {player.position}
                                </td>
                                <td className="py-1 px-2 text-sm">
                                  {player.fantasy_team}
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
                              Position
                            </th>
                            <th className="py-1 px-2 text-left text-xs">
                              Fantasy Team
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {game.home_team_players.map((player, idx) => (
                            <tr key={idx} className="border-t hover:bg-gray-50">
                              <td className="py-1 px-2 text-sm">
                                {player.player_name}
                              </td>
                              <td className="py-1 px-2 text-sm">
                                {player.position}
                              </td>
                              <td className="py-1 px-2 text-sm">
                                {player.fantasy_team}
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
