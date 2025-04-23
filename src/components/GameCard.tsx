import React from "react";
import { Game } from "../api/client";

interface GameCardProps {
  game: Game;
  timeString: string;
  gameStatus: string;
  getStatusClass: (status: string) => string;
}

// Function to get team primary color
const getTeamPrimaryColor = (teamName: string): string => {
  // Complete mapping of team abbreviations and names to primary colors
  const teamColors: Record<string, string> = {
    // Team abbreviations
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

    // Full team names
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

    // Common names/nicknames
    Ducks: "#F47A38",
    Coyotes: "#8C2633",
    Bruins: "#FFB81C",
    Sabres: "#002654",
    Flames: "#C8102E",
    Hurricanes: "#CC0000",
    Blackhawks: "#CF0A2C",
    Avalanche: "#6F263D",
    "Blue Jackets": "#002654",
    Stars: "#006847",
    "Red Wings": "#CE1126",
    Oilers: "#FF4C00",
    Panthers: "#C8102E",
    Kings: "#111111",
    Wild: "#154734",
    Canadiens: "#AF1E2D",
    Habs: "#AF1E2D",
    Predators: "#FFB81C",
    Devils: "#CE1126",
    Islanders: "#00539B",
    Rangers: "#0038A8",
    Senators: "#C52032",
    Flyers: "#F74902",
    Penguins: "#FFB81C",
    Sharks: "#006D75",
    Kraken: "#99D9D9",
    Blues: "#002F87",
    Lightning: "#002868",
    Bolts: "#002868",
    "Maple Leafs": "#00205B",
    Leafs: "#00205B",
    Canucks: "#00205B",
    "Golden Knights": "#B4975A",
    Knights: "#B4975A",
    Capitals: "#C8102E",
    Caps: "#C8102E",
    Jets: "#041E42",
  };

  // First, check for exact match
  if (teamColors[teamName]) {
    return teamColors[teamName];
  }

  // If exact match not found, check for abbreviation match
  if (teamName.length === 3 && teamColors[teamName]) {
    return teamColors[teamName];
  }

  // Then try to find partial matches
  for (const [key, color] of Object.entries(teamColors)) {
    if (teamName.includes(key)) {
      return color;
    }
  }

  // Default color if team not found
  return "#041E42"; // NHL blue
};

// Helper function to determine series display
const getSeriesDisplay = (game: Game, isAwayTeam: boolean): string | null => {
  // Only display series info in playoffs
  if (!game.series_status || !game.series_status.round) {
    return null;
  }

  const {
    topSeedTeamAbbrev,
    bottomSeedTeamAbbrev,
    topSeedWins,
    bottomSeedWins,
  } = game.series_status;

  // Get the team's abbreviation
  const teamAbbrev = isAwayTeam
    ? game.away_team.length > 3
      ? game.away_team.substring(0, 3)
      : game.away_team
    : game.home_team.length > 3
      ? game.home_team.substring(0, 3)
      : game.home_team;

  // Determine if this team is the top seed
  const isTopSeed = topSeedTeamAbbrev === teamAbbrev;

  // Return the appropriate series record
  if (isTopSeed) {
    return `${topSeedWins}-${bottomSeedWins}`;
  } else {
    return `${bottomSeedWins}-${topSeedWins}`;
  }
};

const GameCard: React.FC<GameCardProps> = ({
  game,
  timeString,
  gameStatus,
  getStatusClass,
}) => {
  // Get team colors
  const awayTeamColor = getTeamPrimaryColor(game.away_team);
  const homeTeamColor = getTeamPrimaryColor(game.home_team);

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg hover:translate-y-px hover:bg-blue-50 cursor-pointer"
      onClick={() =>
        window.open(`https://www.nhl.com/gamecenter/${game.id}`, "_blank")
      }
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
            <div className="text-sm">{game.venue}</div>
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
                        {game.away_team.length > 3
                          ? game.away_team.substring(0, 3)
                          : game.away_team}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="text-lg font-bold">{game.away_team}</div>
                    {game.series_status && game.series_status.round && (
                      <div className="text-xs text-gray-500">
                        {getSeriesDisplay(game, true)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="px-4 text-center">
                {game.away_score !== undefined &&
                game.away_score !== null &&
                game.home_score !== undefined &&
                game.home_score !== null ? (
                  <div className="flex items-center">
                    <div className="text-3xl font-bold">{game.away_score}</div>
                    <div className="mx-2 text-gray-400">-</div>
                    <div className="text-3xl font-bold">{game.home_score}</div>
                  </div>
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
                    <div className="text-lg font-bold">{game.home_team}</div>
                    {game.series_status && game.series_status.round && (
                      <div className="text-xs text-gray-500">
                        {getSeriesDisplay(game, false)}
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
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center ml-3">
                      <span className="text-sm font-bold">
                        {game.home_team.length > 3
                          ? game.home_team.substring(0, 3)
                          : game.home_team}
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
    </div>
  );
};

export default GameCard;
