import { Link } from "react-router-dom";
import { GamesResponse } from "../../types/games";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import GameCard from "../games/GameCard";
import { toLocalDateString } from "../../utils/timezone";

interface GamesTabProps {
  isLoading: boolean;
  error: unknown;
  data: GamesResponse | undefined;
}

export default function GamesTab({ isLoading, error, data }: GamesTabProps) {
  if (isLoading) {
    return <LoadingSpinner message="Loading today's games..." />;
  }

  if (error) {
    return <ErrorMessage message="Could not load today's games." />;
  }

  const games = data?.games || [];

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
        } catch {
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
}
