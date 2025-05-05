import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import DateHeader from "../components/common/DateHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import { toLocalDateString } from "../utils/timezone";
import { MatchDayResponse } from "../types/matchDay";

const MatchDayPage = () => {
  const navigate = useNavigate();

  // Get date from URL parameter or use current date
  const { date: dateParam } = useParams<{ date?: string }>();

  // Get current date in YYYY-MM-DD format for initial load
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // If there's a valid date in the URL, use it
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return dateParam;
    }
    // Otherwise, use today
    return toLocalDateString(new Date());
  });

  // Fetch match day data
  const {
    data: matchDayData,
    isLoading,
    error,
    refetch,
  } = useQuery<MatchDayResponse>({
    queryKey: ["matchDay", selectedDate],
    queryFn: () => api.getMatchDay(selectedDate),
  });

  // Handler for date change
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    navigate(`/match-day/${newDate}`);
  };

  // Handler for refresh
  const handleRefresh = () => {
    refetch();
  };

  // Function to get team primary color
  const getTeamPrimaryColor = (teamName: string): string => {
    const teamColors: Record<string, string> = {
      FLA: "#C8102E", // Florida Panthers
      TBL: "#002868", // Tampa Bay Lightning
      DAL: "#006847", // Dallas Stars
      COL: "#6F263D", // Colorado Avalanche
      WPG: "#041E42", // Winnipeg Jets
      BOS: "#FFB81C", // Boston Bruins
      // Add more teams as needed
    };

    // Try to find the team
    if (teamColors[teamName]) {
      return teamColors[teamName];
    }

    // Default color if team not found
    return "#041E42"; // NHL blue
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <DateHeader
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          isFloating={true}
        />
        <div className="mt-8">
          <LoadingSpinner size="large" message="Loading match day data..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <DateHeader
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          isFloating={true}
        />
        <div className="mt-8">
          <ErrorMessage
            message="Failed to load match day data. Please try again."
            onRetry={handleRefresh}
          />
        </div>
      </div>
    );
  }

  const games = matchDayData?.games || [];
  const fantasyTeams = matchDayData?.fantasyTeams || [];
  const summary = matchDayData?.summary || {
    totalGames: 0,
    totalTeamsPlaying: 0,
    teamPlayersCount: [],
  };

  // Format date for display
  const formattedDate = new Date(selectedDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="px-4 py-6">
      {/* Date selector */}
      <DateHeader
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        isFloating={true}
      />

      {/* Header Summary */}
      <div className="mt-6 mb-6">
        <div className="ranking-table-container">
          <div className="ranking-table-header p-5 border-b border-gray-100 bg-gradient-to-r from-[#041E42]/95 to-[#6D4C9F]/95 text-white">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold mb-1">Match Day Overview</h1>
                <span className="bg-yellow-300/20 text-yellow-300 text-xs px-3 py-1 rounded-full font-medium">
                  {formattedDate}
                </span>
              </div>
              <div className="flex flex-col sm:items-end">
                <div className="text-lg font-semibold">
                  {summary.totalGames} Games • {summary.totalTeamsPlaying} Teams
                  Playing
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {summary.teamPlayersCount.map((team) => (
                    <span
                      key={team.nhlTeam}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white/10"
                    >
                      {team.nhlTeam}: {team.playerCount} players
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fantasy Summary */}
      <FantasySummary fantasyTeams={fantasyTeams} />

      {/* Games Section */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {games.map((game) => (
          <div key={game.id} className="space-y-4">
            <GameCard game={game} getTeamPrimaryColor={getTeamPrimaryColor} />
            <PlayerComparison game={game} fantasyTeams={fantasyTeams} />
          </div>
        ))}
      </div>

      {/* Fantasy Teams Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Fantasy Teams in Action</h2>
        <div className="grid grid-cols-1 gap-6">
          {fantasyTeams
            .sort((a, b) => b.totalPlayersToday - a.totalPlayersToday)
            .map((team) => (
              <FantasyTeamCard
                key={team.teamId}
                team={team}
                getTeamPrimaryColor={getTeamPrimaryColor}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

// Game Card Component
const GameCard = ({ game, getTeamPrimaryColor }) => {
  const awayTeamColor = getTeamPrimaryColor(game.awayTeam);
  const homeTeamColor = getTeamPrimaryColor(game.homeTeam);
  const [expanded, setExpanded] = useState(false);

  // Toggle expansion state
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

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
                className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusClass(gameStatus)}`}
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
                        {game.awayTeam}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="text-base font-bold">{game.awayTeam}</div>
                    {game.seriesStatus && game.seriesStatus.round > 0 && (
                      <div className="text-xs text-gray-500">
                        Series:{" "}
                        {game.seriesStatus.topSeedTeamAbbrev === game.awayTeam
                          ? `${game.seriesStatus.topSeedWins}-${game.seriesStatus.bottomSeedWins}`
                          : `${game.seriesStatus.bottomSeedWins}-${game.seriesStatus.topSeedWins}`}
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
              </div>

              {/* Home team */}
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end">
                  <div className="text-right">
                    <div className="text-base font-bold">{game.homeTeam}</div>
                    {game.seriesStatus && game.seriesStatus.round > 0 && (
                      <div className="text-xs text-gray-500">
                        Series:{" "}
                        {game.seriesStatus.topSeedTeamAbbrev === game.homeTeam
                          ? `${game.seriesStatus.topSeedWins}-${game.seriesStatus.bottomSeedWins}`
                          : `${game.seriesStatus.bottomSeedWins}-${game.seriesStatus.topSeedWins}`}
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
                        {game.homeTeam}
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
          className="w-2 flex-shrink-0"
          style={{ backgroundColor: homeTeamColor }}
        ></div>
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleExpand}
        className="w-full py-2 px-4 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border-t border-gray-200 flex items-center justify-center transition-colors"
      >
        {expanded ? "Hide" : "Show"} Game Details
        <svg
          className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
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

      {/* Expanded game details */}
      {expanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Game stats */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-2">Game Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Series:</span>
                  <span className="font-medium">
                    {game.seriesStatus
                      ? `${game.seriesStatus.topSeedTeamAbbrev} ${game.seriesStatus.topSeedWins}-${game.seriesStatus.bottomSeedWins} ${game.seriesStatus.bottomSeedTeamAbbrev}`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Game of Series:</span>
                  <span className="font-medium">
                    {game.seriesStatus
                      ? `Game ${game.seriesStatus.gameNumberOfSeries}`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Round:</span>
                  <span className="font-medium">
                    {game.seriesStatus
                      ? `${game.seriesStatus.seriesTitle}`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Venue:</span>
                  <span className="font-medium">{game.venue || "-"}</span>
                </div>
              </div>

              <div className="mt-4">
                <a
                  href={`https://www.nhl.com/gamecenter/${game.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#6D4C9F] hover:underline flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  View on NHL.com
                </a>
              </div>
            </div>

            {/* Game links */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-2">Quick Links</h3>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://www.nhl.com/gamecenter/${game.id}/boxscore`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Box Score
                </a>
                <a
                  href={`https://www.nhl.com/gamecenter/${game.id}/recap`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Recap
                </a>
                <a
                  href={`https://www.nhl.com/stats/teams?game=${game.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Team Stats
                </a>
                <a
                  href={`https://www.nhl.com/stats/players?game=${game.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Player Stats
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Fantasy Team Card Component
const FantasyTeamCard = ({ team, getTeamPrimaryColor }) => {
  const [expanded, setExpanded] = useState(false);

  // Generate a gradient for the fantasy team
  const getTeamGradient = (name) => {
    // Simple hash function for consistent colors based on team name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate hues with good spacing
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 40) % 360;

    return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 80%, 45%))`;
  };

  const teamGradient = getTeamGradient(team.teamName);

  // Categorize players by NHL team
  const playersByTeam = team.playersInAction.reduce((acc, player) => {
    if (!acc[player.nhlTeam]) {
      acc[player.nhlTeam] = [];
    }
    acc[player.nhlTeam].push(player);
    return acc;
  }, {});

  // Calculate team stats
  const teamStats = {
    totalPlayoffPoints: team.playersInAction.reduce(
      (sum, player) => sum + (player.playoffPoints || 0),
      0,
    ),
    totalPlayoffGoals: team.playersInAction.reduce(
      (sum, player) => sum + (player.playoffGoals || 0),
      0,
    ),
    totalPlayoffAssists: team.playersInAction.reduce(
      (sum, player) => sum + (player.playoffAssists || 0),
      0,
    ),
    // Calculate form points (last 5 games)
    totalFormPoints: team.playersInAction.reduce(
      (sum, player) => sum + (player.form?.points || 0),
      0,
    ),
  };

  // Get top performing player
  const topPlayer = [...team.playersInAction].sort(
    (a, b) => (b.playoffPoints || 0) - (a.playoffPoints || 0),
  )[0];

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Team header */}
      <div
        className="p-4 flex items-center justify-between"
        style={{ background: teamGradient }}
      >
        <div className="flex items-center">
          <div className="text-white">
            <h3 className="text-lg font-bold">
              <Link
                to={`/fantasy-teams/${team.teamId}`}
                className="hover:underline"
              >
                {team.teamName}
              </Link>
            </h3>
            <div className="text-sm opacity-90">
              {team.totalPlayersToday} Players in Action Today
            </div>
          </div>
        </div>

        {/* Team stats badges */}
        <div className="hidden md:flex space-x-2">
          <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
            {teamStats.totalPlayoffPoints} Playoff Pts
          </div>
          <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
            {teamStats.totalFormPoints} Form Pts
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="bg-white/30 text-white p-2 rounded-full hover:bg-white/40 transition-colors"
        >
          <svg
            className={`w-5 h-5 transform transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Team quick stats - visible even when collapsed */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">NHL Teams</div>
            <div className="font-bold text-lg">
              {Object.keys(playersByTeam).length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Playoff Points</div>
            <div className="font-bold text-lg">
              {teamStats.totalPlayoffPoints}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Top Performer</div>
            <div className="font-bold text-sm truncate">
              {topPlayer && (
                <a
                  href={`https://www.nhl.com/player/${topPlayer.nhlId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#6D4C9F]"
                >
                  {topPlayer.playerName}
                </a>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Form Points</div>
            <div className="font-bold text-lg">{teamStats.totalFormPoints}</div>
          </div>
        </div>
      </div>

      {/* Team players */}
      {expanded && (
        <div className="p-4 bg-gray-50">
          {Object.entries(playersByTeam).map(([nhlTeam, players]) => (
            <div key={nhlTeam} className="mb-4 last:mb-0">
              <div className="flex items-center mb-2">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getTeamPrimaryColor(nhlTeam) }}
                ></div>
                <h4 className="font-medium text-gray-700">{nhlTeam} Players</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {players.map((player, index) => (
                  <PlayerWithStats key={index} player={player} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Updated PlayerWithStats component with form tooltip
const PlayerWithStats = ({ player }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
      <div className="flex items-center mb-2">
        {player.imageUrl ? (
          <img
            src={player.imageUrl}
            alt={player.playerName}
            className="w-10 h-10 rounded-full mr-2 border border-gray-200"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-2">
            <span className="text-xs font-medium">
              {player.playerName.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <div className="font-medium text-gray-900">
            <a
              href={`https://www.nhl.com/player/${player.nhlId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#6D4C9F]"
            >
              {player.playerName}
            </a>
          </div>
          <div className="text-xs text-gray-500">
            {player.position} • {player.nhlTeam}
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="border-t border-gray-100 pt-2 mt-2">
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="bg-gray-50 rounded p-1">
            <div className="text-xs text-gray-500">Today</div>
            <div className="font-medium text-gray-900">
              {player.points || 0}
            </div>
          </div>
          <div className="bg-gray-50 rounded p-1">
            <div className="text-xs text-gray-500">Playoffs</div>
            <div className="font-medium text-gray-900">
              {player.playoffPoints || 0}
            </div>
          </div>
          <div className="bg-gray-50 rounded p-1 group relative">
            <div className="text-xs text-gray-500 flex items-center justify-center">
              Last 5
              <span className="text-gray-400 hover:text-gray-600 ml-1 cursor-help">
                ⓘ
                <span className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-full left-1/2 transform -translate-x-1/2 w-48 bg-gray-900 text-white text-xs rounded py-1 px-2 shadow-lg z-50 mb-2">
                  <span className="block font-medium mb-1">
                    Form Calculation:
                  </span>
                  <span className="block">
                    Combined stats from player's 5 most recent games showing
                    current performance trend.
                  </span>
                  <span className="absolute bottom-[-5px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900"></span>
                </span>
              </span>
            </div>
            <div className="font-medium text-gray-900">
              {player.form?.points || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Recent form if available */}
      {player.form && (
        <div className="text-xs text-gray-500 mt-2 flex justify-between">
          <span>
            Form: {player.form.goals}G {player.form.assists}A
          </span>
          <span>TOI: {player.timeOnIce || "-"}</span>
        </div>
      )}
    </div>
  );
};

// Fantasy Summary Component
const FantasySummary = ({ fantasyTeams }) => {
  if (!fantasyTeams || fantasyTeams.length === 0) {
    return null;
  }

  // Sort teams by number of players in action
  const sortedTeams = [...fantasyTeams].sort(
    (a, b) => b.totalPlayersToday - a.totalPlayersToday,
  );

  // Calculate some summary stats
  const totalPlayersInAction = fantasyTeams.reduce(
    (sum, team) => sum + team.totalPlayersToday,
    0,
  );
  const maxPlayers = Math.max(
    ...fantasyTeams.map((team) => team.totalPlayersToday),
  );
  const teamsWithMaxPlayers = fantasyTeams.filter(
    (team) => team.totalPlayersToday === maxPlayers,
  ).length;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Fantasy Summary</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-sm text-blue-600 mb-1">Fantasy Teams Active</div>
          <div className="text-3xl font-bold text-blue-800">
            {fantasyTeams.length}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-sm text-green-600 mb-1">
            Total Players Active
          </div>
          <div className="text-3xl font-bold text-green-800">
            {totalPlayersInAction}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-sm text-purple-600 mb-1">
            Max Players per Team
          </div>
          <div className="text-3xl font-bold text-purple-800">{maxPlayers}</div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-sm text-yellow-600 mb-1">
            Teams with Max Players
          </div>
          <div className="text-3xl font-bold text-yellow-800">
            {teamsWithMaxPlayers}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Players Today
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player Distribution
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedTeams.map((team, index) => {
              // Get counts of players per NHL team
              const nhlTeamCounts = team.playersInAction.reduce(
                (acc, player) => {
                  acc[player.nhlTeam] = (acc[player.nhlTeam] || 0) + 1;
                  return acc;
                },
                {},
              );

              return (
                <tr key={team.teamId} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm whitespace-nowrap">
                    <div className="text-center w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm whitespace-nowrap">
                    <Link
                      to={`/fantasy-teams/${team.teamId}`}
                      className="font-medium text-[#6D4C9F] hover:underline"
                    >
                      {team.teamName}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-sm whitespace-nowrap">
                    <div className="bg-[#6D4C9F]/10 text-[#6D4C9F] text-sm font-medium px-2 py-1 rounded-full inline-flex items-center">
                      {team.totalPlayersToday} Players
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(nhlTeamCounts).map(([team, count]) => (
                        <span
                          key={team}
                          className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded"
                        >
                          {team}: {count}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Player Comparison Component
const PlayerComparison = ({ game, fantasyTeams }) => {
  // Get all players from this game
  const getAllGamePlayers = () => {
    const players = [];

    // Extract players from all fantasy teams that are playing in this game
    fantasyTeams.forEach((team) => {
      team.playersInAction.forEach((player) => {
        if (
          player.nhlTeam === game.homeTeam ||
          player.nhlTeam === game.awayTeam
        ) {
          players.push(player);
        }
      });
    });

    return players;
  };

  // Get players grouped by their NHL team
  const getPlayersByNHLTeam = () => {
    const allPlayers = getAllGamePlayers();
    const homeTeamPlayers = allPlayers
      .filter((p) => p.nhlTeam === game.homeTeam)
      .sort((a, b) => (b.playoffPoints || 0) - (a.playoffPoints || 0));
    const awayTeamPlayers = allPlayers
      .filter((p) => p.nhlTeam === game.awayTeam)
      .sort((a, b) => (b.playoffPoints || 0) - (a.playoffPoints || 0));

    return {
      homeTeamPlayers,
      awayTeamPlayers,
    };
  };

  // Create player comparison pairs
  const createComparisonPairs = () => {
    const { homeTeamPlayers, awayTeamPlayers } = getPlayersByNHLTeam();
    const pairs = [];

    // Create pairs based on the smaller team's size
    const pairCount = Math.min(homeTeamPlayers.length, awayTeamPlayers.length);

    for (let i = 0; i < pairCount; i++) {
      pairs.push({
        homePlayer: homeTeamPlayers[i],
        awayPlayer: awayTeamPlayers[i],
      });
    }

    return pairs;
  };

  const playerPairs = createComparisonPairs();

  if (playerPairs.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-3">Player Matchups</h3>
      <div className="space-y-4">
        {playerPairs.slice(0, 3).map((pair, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
          >
            <div className="grid grid-cols-2 divide-x divide-gray-200">
              {/* Away Player */}
              <div className="p-4">
                <div className="flex items-center mb-2">
                  {pair.awayPlayer.imageUrl ? (
                    <img
                      src={pair.awayPlayer.imageUrl}
                      alt={pair.awayPlayer.playerName}
                      className="w-12 h-12 rounded-full mr-3 border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium">
                        {pair.awayPlayer.playerName
                          .substring(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <a
                      href={`https://www.nhl.com/player/${pair.awayPlayer.nhlId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-900 hover:text-[#6D4C9F] block"
                    >
                      {pair.awayPlayer.playerName}
                    </a>
                    <div className="text-xs text-gray-500 flex items-center">
                      {pair.awayPlayer.teamLogo && (
                        <img
                          src={pair.awayPlayer.teamLogo}
                          alt={pair.awayPlayer.nhlTeam}
                          className="w-4 h-4 mr-1"
                        />
                      )}
                      <span>
                        {pair.awayPlayer.position} • {pair.awayPlayer.nhlTeam}
                      </span>
                    </div>
                    <div className="text-xs text-[#6D4C9F]">
                      {pair.awayPlayer.fantasyTeam}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Pts</div>
                    <div className="font-bold text-lg">
                      {pair.awayPlayer.playoffPoints}
                    </div>
                  </div>
                  <div className="text-center bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Goals</div>
                    <div className="font-bold text-lg">
                      {pair.awayPlayer.playoffGoals}
                    </div>
                  </div>
                  <div className="text-center bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Assists</div>
                    <div className="font-bold text-lg">
                      {pair.awayPlayer.playoffAssists}
                    </div>
                  </div>
                </div>

                {/* Form */}
                {pair.awayPlayer.form && (
                  <div className="mt-3 text-sm">
                    <div className="text-xs text-gray-500 mb-1">
                      Last {pair.awayPlayer.form.games} games
                    </div>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        {pair.awayPlayer.form.goals} G
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {pair.awayPlayer.form.assists} A
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        {pair.awayPlayer.form.points} PTS
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Home Player */}
              <div className="p-4">
                <div className="flex items-center mb-2">
                  {pair.homePlayer.imageUrl ? (
                    <img
                      src={pair.homePlayer.imageUrl}
                      alt={pair.homePlayer.playerName}
                      className="w-12 h-12 rounded-full mr-3 border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium">
                        {pair.homePlayer.playerName
                          .substring(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <a
                      href={`https://www.nhl.com/player/${pair.homePlayer.nhlId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-900 hover:text-[#6D4C9F] block"
                    >
                      {pair.homePlayer.playerName}
                    </a>
                    <div className="text-xs text-gray-500 flex items-center">
                      {pair.homePlayer.teamLogo && (
                        <img
                          src={pair.homePlayer.teamLogo}
                          alt={pair.homePlayer.nhlTeam}
                          className="w-4 h-4 mr-1"
                        />
                      )}
                      <span>
                        {pair.homePlayer.position} • {pair.homePlayer.nhlTeam}
                      </span>
                    </div>
                    <div className="text-xs text-[#6D4C9F]">
                      {pair.homePlayer.fantasyTeam}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Playoff Pts</div>
                    <div className="font-bold text-lg">
                      {pair.homePlayer.playoffPoints}
                    </div>
                  </div>
                  <div className="text-center bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Goals</div>
                    <div className="font-bold text-lg">
                      {pair.homePlayer.playoffGoals}
                    </div>
                  </div>
                  <div className="text-center bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Assists</div>
                    <div className="font-bold text-lg">
                      {pair.homePlayer.playoffAssists}
                    </div>
                  </div>
                </div>

                {/* Form */}
                {pair.homePlayer.form && (
                  <div className="mt-3 text-sm">
                    <div className="text-xs text-gray-500 mb-1">
                      Last {pair.homePlayer.form.games} games
                    </div>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        {pair.homePlayer.form.goals} G
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {pair.homePlayer.form.assists} A
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        {pair.homePlayer.form.points} PTS
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchDayPage;
