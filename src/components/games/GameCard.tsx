import { Game } from "../../types/games";
import PlayerCard from "../common/PlayerCard";

interface StandardGameCardProps {
  game: Game;
  isExpanded: boolean;
  onToggleExpand: () => void;
  getTeamPrimaryColor: (teamName: string) => string;
}

const GameCard = ({
  game,
  isExpanded,
  onToggleExpand,
  getTeamPrimaryColor,
}: StandardGameCardProps) => {
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

  // Game status
  const gameStatus = game.gameState || "SCHEDULED";

  // Check if game is live
  const isLive = gameStatus.toUpperCase() === "LIVE";

  // Check if game is complete
  const isGameComplete = gameStatus === "FINAL" || gameStatus === "OFF";

  // Get team colors
  const awayTeamColor = getTeamPrimaryColor(game.awayTeam);
  const homeTeamColor = getTeamPrimaryColor(game.homeTeam);

  // Helper function to determine status display
  const getStatusClass = (status: string): string => {
    switch (status.toUpperCase()) {
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

  // Helper function to determine series display
  const getSeriesDisplay = (isAwayTeam: boolean): string | null => {
    if (!game.seriesStatus || !game.seriesStatus.round) {
      return null;
    }

    const { topSeedTeamAbbrev, topSeedWins, bottomSeedWins } =
      game.seriesStatus;

    // Get the team's abbreviation
    const teamAbbrev = isAwayTeam
      ? game.awayTeam.substring(0, 3).toUpperCase()
      : game.homeTeam.substring(0, 3).toUpperCase();

    // Determine if this team is the top seed
    const isTopSeed = topSeedTeamAbbrev === teamAbbrev;

    // Return the appropriate series record
    if (isTopSeed) {
      return `${topSeedWins}-${bottomSeedWins}`;
    } else {
      return `${bottomSeedWins}-${topSeedWins}`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-lg">
      <div className="flex">
        {/* Left team color bar */}
        <div
          className="w-2 flex-shrink-0"
          style={{ backgroundColor: awayTeamColor }}
        ></div>

        {/* Main content */}
        <div className="flex-grow">
          {/* Game header */}
          <div className="bg-gray-50 p-1 py-2 flex items-center justify-between">
            <div className="text-sm font-bold text-gray-700 pl-5">
              {timeString}
            </div>
            <div className="pr-2 py-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusClass(gameStatus)} ${isLive ? "animate-pulse" : ""}`}
              >
                {gameStatus === "PRE" ? "SCHEDULED" : gameStatus}
                {game.period && ` • ${game.period}`}
              </span>
            </div>
          </div>

          {/* Team matchup */}
          <div
            className="p-4 cursor-pointer"
            onClick={() =>
              window.open(`https://www.nhl.com/gamecenter/${game.id}`, "_blank")
            }
          >
            <div className="flex items-center">
              {/* Away team */}
              <div className="flex-1">
                <div className="flex items-center">
                  {game.awayTeamLogo ? (
                    <img
                      src={game.awayTeamLogo}
                      alt={`${game.awayTeam} logo`}
                      className="w-10 h-10 mr-3"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: `${awayTeamColor}20` }}
                    >
                      <span
                        className="text-sm font-bold"
                        style={{ color: awayTeamColor }}
                      >
                        {game.awayTeam.substring(0, 3)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="text-base font-bold">{game.awayTeam}</div>
                    {game.seriesStatus && game.seriesStatus.round > 0 && (
                      <div className="text-xs text-gray-500">
                        {getSeriesDisplay(true)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="px-4 text-center">
                {game.awayScore !== undefined &&
                game.awayScore !== null &&
                game.homeScore !== undefined &&
                game.homeScore !== null ? (
                  <div className="flex items-center">
                    <div className="text-2xl font-bold">{game.awayScore}</div>
                    <div className="mx-2 text-gray-300">-</div>
                    <div className="text-2xl font-bold">{game.homeScore}</div>
                  </div>
                ) : (
                  <div className="text-base font-bold text-gray-400">VS</div>
                )}
                {isLive && game.period && (
                  <div className="text-xs text-red-600 font-bold mt-1 animate-pulse">
                    {game.period}
                  </div>
                )}
              </div>

              {/* Home team */}
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end">
                  <div className="text-right">
                    <div className="text-base font-bold">{game.homeTeam}</div>
                    {game.seriesStatus && game.seriesStatus.round > 0 && (
                      <div className="text-xs text-gray-500">
                        {getSeriesDisplay(false)}
                      </div>
                    )}
                  </div>
                  {game.homeTeamLogo ? (
                    <img
                      src={game.homeTeamLogo}
                      alt={`${game.homeTeam} logo`}
                      className="w-10 h-10 ml-3"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center ml-3"
                      style={{ backgroundColor: `${homeTeamColor}20` }}
                    >
                      <span
                        className="text-sm font-bold"
                        style={{ color: homeTeamColor }}
                      >
                        {game.homeTeam.substring(0, 3)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Game links (for completed games) */}
            {isGameComplete && (
              <div className="mt-3 pt-2 border-t border-gray-100 text-xs flex justify-center space-x-4">
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
          </div>
        </div>

        {/* Right team color bar */}
        <div
          className="w-2 flex-shrink-0"
          style={{ backgroundColor: homeTeamColor }}
        ></div>
      </div>

      {/* Expand/Collapse toggle - Now with shadow and border */}
      <button
        className="w-full py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center border-t border-gray-200 shadow-sm transition-all"
        onClick={onToggleExpand}
      >
        {isExpanded ? "Hide" : "Show"} Skater Details
        <svg
          className={`ml-2 h-4 w-4 transform ${isExpanded ? "rotate-180" : ""} transition-transform duration-200`}
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

      {/* Player details (collapsible) - Using our standardized card layout with shadow */}
      {isExpanded && (
        <PlayerDetails
          game={game}
          awayTeamColor={awayTeamColor}
          homeTeamColor={homeTeamColor}
        />
      )}
    </div>
  );
};

// Separate component for player details using PlayerCard
const PlayerDetails = ({
  game,
  awayTeamColor,
  homeTeamColor,
}: {
  game: Game;
  awayTeamColor: string;
  homeTeamColor: string;
}) => {
  return (
    <div className="border-t border-gray-200 shadow-inner">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gray-50">
        {/* Away team players */}
        <div className="bg-white rounded-lg p-1">
          <div className="flex items-center mb-3">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: awayTeamColor }}
            ></div>
            <h3 className="font-bold text-sm">{game.awayTeam} Skaters</h3>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {game.awayTeamPlayers.map((player, idx) => {
              player.nhlTeam = game.awayTeam;

              return (
                <PlayerCard
                  key={idx}
                  player={player}
                  compact={true}
                  showFantasyTeam={true}
                  showPoints={true}
                  valueLabel="pts"
                />
              );
            })}
          </div>
        </div>

        {/* Home team players */}
        <div className="bg-white rounded-lg p-1">
          <div className="flex items-center mb-3">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: homeTeamColor }}
            ></div>
            <h3 className="font-bold text-sm">{game.homeTeam} Skaters</h3>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {game.homeTeamPlayers.map((player, idx) => {
              player.nhlTeam = game.homeTeam;

              return (
                <PlayerCard
                  key={idx}
                  player={player}
                  compact={true}
                  showFantasyTeam={true}
                  showPoints={true}
                  valueLabel="pts"
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
