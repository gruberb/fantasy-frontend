import { Game } from "../../types/games";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import GameOptions from "./GameOptions";
import GameDetailView from "./GameDetailView";
import NoGamesMessage from "./NoGamesMessage";

interface GamesTabContentProps {
  filteredGames: Game[];
  isLoading: boolean;
  error: unknown;
  hasLiveGames: boolean;
  autoRefresh: boolean;
  setAutoRefresh: (value: boolean) => void;
  onRefresh: () => void;
  expandedGames: Set<number>;
  toggleGameExpansion: (gameId: number) => void;
  getTeamPrimaryColor: (teamName: string) => string;
}

export default function GamesTabContent({
  filteredGames,
  isLoading,
  error,
  hasLiveGames,
  autoRefresh,
  setAutoRefresh,
  onRefresh,
  expandedGames,
  toggleGameExpansion,
  getTeamPrimaryColor,
}: GamesTabContentProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" message="Loading games data..." />
      </div>
    );
  }

  // Error handling
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <ErrorMessage message="Failed to load games data. Please try again." />
        <div className="mt-4">
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-[#6D4C9F] text-white rounded-md hover:bg-[#5A3A87] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No games check
  if (!filteredGames || filteredGames.length === 0) {
    return <NoGamesMessage />;
  }

  return (
    <div>
      {/* Options */}
      <GameOptions
        hasLiveGames={hasLiveGames}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        onRefresh={onRefresh}
      />

      {/* Games list */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Game Schedule</h2>
        </div>

        <div className="space-y-6">
          {filteredGames.map((game) => (
            <GameDetailView
              key={game.id}
              game={game}
              expandedGames={expandedGames}
              toggleGameExpansion={toggleGameExpansion}
              getTeamPrimaryColor={getTeamPrimaryColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
