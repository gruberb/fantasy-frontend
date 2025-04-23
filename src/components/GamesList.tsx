import { Link } from "react-router-dom";
import { Game } from "../api/client";

interface GamesListProps {
  games: Game[];
  title?: string;
  showDate?: boolean;
  limit?: number;
}

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

const GamesList = ({
  games,
  title = "Today's Games",
  showDate = true,
  limit,
}: GamesListProps) => {
  // Apply limit if provided
  const displayGames = limit ? games.slice(0, limit) : games;

  if (displayGames.length === 0) {
    return (
      <div>
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        <p className="text-gray-500">No games scheduled.</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          {limit && games.length > limit && (
            <Link to="/games" className="text-blue-600 hover:underline">
              View All →
            </Link>
          )}
        </div>
      )}

      <div className="space-y-4">
        {displayGames.map((game) => {
          // Simple time conversion using the date from API
          let timeString;
          let dateString;

          try {
            // Parse the ISO 8601 date string directly
            const gameDate = new Date(game.start_time);

            // Format for display
            timeString = gameDate.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });

            dateString = gameDate.toLocaleDateString([], {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
          } catch (e) {
            timeString = "Time TBD";
            dateString = "Date TBD";
          }

          // Game status
          const gameStatus = game.game_state || "SCHEDULED";

          return (
            <div
              key={game.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Game header */}
              <div className="bg-gray-50 p-3 flex justify-between items-center">
                <div>
                  {showDate && (
                    <div className="text-sm text-gray-500">{dateString}</div>
                  )}
                  <div className="font-medium">{timeString}</div>
                  <div className="text-xs text-gray-500">{game.venue}</div>
                </div>
                <div className="flex items-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(gameStatus)}`}
                  >
                    {gameStatus === "PRE" ? "SCHEDULED" : gameStatus}
                    {game.period && ` - ${game.period}`}
                  </span>
                </div>
              </div>

              {/* Game content */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  {/* Away team */}
                  <div className="flex items-center">
                    <div className="text-center mr-2">
                      {game.away_team_logo ? (
                        <img
                          src={game.away_team_logo}
                          alt={`${game.away_team} logo`}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 flex items-center justify-center rounded-full">
                          <span className="text-xs font-bold text-gray-500">
                            {game.away_team}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="font-medium">{game.away_team}</div>
                    {game.away_score !== undefined &&
                      game.away_score !== null && (
                        <div className="ml-2 text-xl font-bold">
                          {game.away_score}
                        </div>
                      )}
                  </div>

                  {/* VS */}
                  <div className="text-sm font-bold text-gray-400 mx-2">@</div>

                  {/* Home team */}
                  <div className="flex items-center">
                    <div className="font-medium">{game.home_team}</div>
                    {game.home_score !== undefined &&
                      game.home_score !== null && (
                        <div className="ml-2 text-xl font-bold">
                          {game.home_score}
                        </div>
                      )}
                    <div className="text-center ml-2">
                      {game.home_team_logo ? (
                        <img
                          src={game.home_team_logo}
                          alt={`${game.home_team} logo`}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 flex items-center justify-center rounded-full">
                          <span className="text-xs font-bold text-gray-500">
                            {game.home_team}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Player summary - new section showing top players from game */}
                {(game.home_team_players?.length > 0 ||
                  game.away_team_players?.length > 0) &&
                  (gameStatus === "FINAL" || gameStatus === "OFF") && (
                    <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                      <div className="flex flex-wrap gap-2">
                        {/* Show up to 3 top players from the game */}
                        {[
                          ...(game.home_team_players || []),
                          ...(game.away_team_players || []),
                        ]
                          .filter((player) => (player.points || 0) > 0)
                          .sort((a, b) => (b.points || 0) - (a.points || 0))
                          .slice(0, 3)
                          .map((player, idx) => (
                            <div key={idx} className="flex items-center">
                              {player.image_url && (
                                <img
                                  src={player.image_url}
                                  alt={player.player_name || player.name || ""}
                                  className="w-5 h-5 rounded-full mr-1"
                                />
                              )}
                              <span>
                                {player.player_name || player.name}:{" "}
                                {player.points || 0} pts
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GamesList;
