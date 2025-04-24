import { useNavigate } from "react-router-dom";
import React from "react";
import { Game } from "../api/client";

interface GameCardProps {
  game: Game;
  timeString: string;
  gameStatus: string;
}

const GameCard: React.FC<GameCardProps> = ({
  game,
  timeString,
  gameStatus,
}) => {
  const navigate = useNavigate();
  // Function to get status class
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

  // Function to get team primary color
  const getTeamPrimaryColor = (teamName: string): string => {
    // This is a simplified mapping - you can expand as needed
    const teamColors: Record<string, string> = {
      "Anaheim Ducks": "#F47A38",
      "Arizona Coyotes": "#8C2633",
      "Boston Bruins": "#FFB81C",
      "Buffalo Sabres": "#002654",
      "Calgary Flames": "#C8102E",
      "Carolina Hurricanes": "#CC0000",
      "Chicago Blackhawks": "#CF0A2C",
      "Colorado Avalanche": "#6F263D",
      "Columbus Blue Jackets": "#002654",
      "Dallas Stars": "#006847",
      "Detroit Red Wings": "#CE1126",
      "Edmonton Oilers": "#FF4C00",
      "Florida Panthers": "#C8102E",
      "Los Angeles Kings": "#111111",
      "Minnesota Wild": "#154734",
      "Montreal Canadiens": "#AF1E2D",
      "Nashville Predators": "#FFB81C",
      "New Jersey Devils": "#CE1126",
      "New York Islanders": "#00539B",
      "New York Rangers": "#0038A8",
      "Ottawa Senators": "#C52032",
      "Philadelphia Flyers": "#F74902",
      "Pittsburgh Penguins": "#FFB81C",
      "San Jose Sharks": "#006D75",
      "Seattle Kraken": "#99D9D9",
      "St. Louis Blues": "#002F87",
      "Tampa Bay Lightning": "#002868",
      "Toronto Maple Leafs": "#00205B",
      "Vancouver Canucks": "#00205B",
      "Vegas Golden Knights": "#B4975A",
      "Washington Capitals": "#C8102E",
      "Winnipeg Jets": "#041E42",
      // Add abbreviated versions
      ANA: "#F47A38",
      ARI: "#8C2633",
      BOS: "#FFB81C",
      BUF: "#002654",
      CGY: "#C8102E",
      CAR: "#CC0000",
      CHI: "#CF0A2C",
      COL: "#6F263D",
      CBJ: "#002654",
      DAL: "#006847",
      DET: "#CE1126",
      EDM: "#FF4C00",
      FLA: "#C8102E",
      LAK: "#111111",
      MIN: "#154734",
      MTL: "#AF1E2D",
      NSH: "#FFB81C",
      NJD: "#CE1126",
      NYI: "#00539B",
      NYR: "#0038A8",
      OTT: "#C52032",
      PHI: "#F74902",
      PIT: "#FFB81C",
      SJS: "#006D75",
      SEA: "#99D9D9",
      STL: "#002F87",
      TBL: "#002868",
      TOR: "#00205B",
      VAN: "#00205B",
      VGK: "#B4975A",
      WSH: "#C8102E",
      WPG: "#041E42",
    };

    // Try to find team by exact match or by including the name
    if (teamColors[teamName]) {
      return teamColors[teamName];
    }

    // Try partial matches for longer team names
    for (const [key, color] of Object.entries(teamColors)) {
      if (teamName.includes(key) || key.includes(teamName)) {
        return color;
      }
    }

    // Default NHL blue
    return "#041E42";
  };

  // Get team colors
  const awayTeamColor = getTeamPrimaryColor(game.awayTeam);
  const homeTeamColor = getTeamPrimaryColor(game.homeTeam);

  // Helper function to determine series display
  const getSeriesDisplay = (isAwayTeam: boolean): string | null => {
    if (!game.seriesStatus || !game.seriesStatus.round) {
      return null;
    }

    const {
      topSeedTeamAbbrev,
      bottomSeedTeamAbbrev,
      topSeedWins,
      bottomSeedWins,
    } = game.seriesStatus;

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

  // Check if game is a playoff game
  const isPlayoffGame = game.seriesStatus && game.seriesStatus.round > 0;

  // Add pulse animation for LIVE games
  const animationClass =
    gameStatus.toUpperCase() === "LIVE" ? "animate-pulse" : "";

  return (
    <div
      className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-md hover:translate-y-px cursor-pointer"
      onClick={() => navigate(`/games`)}
    >
      <div className="flex">
        {/* Left team color bar */}
        <div
          className="w-2 flex-shrink-0"
          style={{ backgroundColor: awayTeamColor }}
        ></div>

        {/* Main content */}
        <div className="flex-grow">
          {/* Game header */}
          <div className="bg-gray-50 p-3 flex items-center justify-between border-b border-gray-100">
            <div className="text-sm font-bold text-gray-700">{timeString}</div>
            <div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusClass(gameStatus)} ${animationClass}`}
              >
                {gameStatus === "PRE" ? "SCHEDULED" : gameStatus}
                {game.period && ` • ${game.period}`}
              </span>
            </div>
          </div>

          {/* Team matchup */}
          <div className="p-4">
            <div className="flex items-center">
              {/* Away team */}
              <div className="flex-1">
                <div className="flex items-center">
                  {game.awayTeamLogo ? (
                    <img
                      src={game.awayTeamLogo}
                      alt={`${game.awayTeam} logo`}
                      className="w-12 h-12 mr-3"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
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
                    <div className="text-lg font-bold">{game.awayTeam}</div>
                    {isPlayoffGame && (
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
                    <div className="text-3xl font-bold">{game.awayScore}</div>
                    <div className="mx-2 text-gray-300">-</div>
                    <div className="text-3xl font-bold">{game.homeScore}</div>
                  </div>
                ) : (
                  <div className="text-lg font-bold text-gray-400">VS</div>
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
                    <div className="text-lg font-bold">{game.homeTeam}</div>
                    {isPlayoffGame && (
                      <div className="text-xs text-gray-500">
                        {getSeriesDisplay(false)}
                      </div>
                    )}
                  </div>
                  {game.homeTeamLogo ? (
                    <img
                      src={game.homeTeamLogo}
                      alt={`${game.homeTeam} logo`}
                      className="w-12 h-12 ml-3"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center ml-3"
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

            {/* Bottom links for completed games */}
            {(gameStatus === "FINAL" || gameStatus === "OFF") && (
              <div className="mt-3 pt-2 border-t border-gray-100 text-xs flex justify-center space-x-4">
                <a
                  href={`https://www.nhl.com/gamecenter/${game.id}/recap`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-600 hover:underline flex items-center"
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
                  className="text-gray-500 hover:text-blue-600 hover:underline flex items-center"
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
    </div>
  );
};

export default GameCard;
