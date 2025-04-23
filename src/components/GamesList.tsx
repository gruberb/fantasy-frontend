import { Link } from "react-router-dom";
import { Game } from "../api/client";
import GameCard from "./GameCard";

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
            <GameCard
              key={game.id}
              game={game}
              timeString={timeString}
              gameStatus={gameStatus}
              getStatusClass={getStatusClass}
            />
          );
        })}
      </div>
    </div>
  );
};

export default GamesList;
