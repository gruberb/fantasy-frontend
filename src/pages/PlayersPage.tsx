import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import { getNHLTeamUrlSlug } from "../utils/nhlTeams";
import { Link } from "react-router-dom";

const PlayersPage = () => {
  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("points");
  const [groupByTeam, setGroupByTeam] = useState(true);

  // Fetch teams to get team names
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: api.getTeams,
  });

  // Fetch all team details to get players
  const { data: teamPointsData, isLoading: playersLoading } = useQuery({
    queryKey: ["allTeamPlayers"],
    queryFn: async () => {
      if (!teams || !Array.isArray(teams)) return [];

      // Fetch points data for each team which includes player info
      const promises = teams.map((team) => api.getTeamPoints(team.id));
      return Promise.all(promises);
    },
    enabled: !!teams && Array.isArray(teams),
  });

  // Process all players from all teams
  const allPlayers = useMemo(() => {
    if (
      !teamPointsData ||
      !Array.isArray(teamPointsData) ||
      teamPointsData.length === 0
    ) {
      return [];
    }

    const players = [];
    // Flatten players from all teams
    for (const teamData of teamPointsData) {
      if (teamData && teamData.players && Array.isArray(teamData.players)) {
        for (const player of teamData.players) {
          players.push({
            ...player,
            teamName: teamData.team_name,
            teamId: teamData.team_id,
            teamAbbreviation: player.nhl_team || "",
            // Generate the URL slug for the NHL team website
            nhlTeamUrlSlug: getNHLTeamUrlSlug(player.nhl_team || ""),
          });
        }
      }
    }
    return players;
  }, [teamPointsData]);

  // Get unique positions for filter
  const positions = useMemo(() => {
    const posSet = new Set(allPlayers.map((player) => player.position));
    return Array.from(posSet).sort();
  }, [allPlayers]);

  // Apply filters and sorting
  const filteredPlayers = useMemo(() => {
    return allPlayers
      .filter((player) => {
        // Text search
        const matchesSearch =
          player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.nhl_team?.toLowerCase().includes(searchTerm.toLowerCase());

        // Position filter
        const matchesPosition =
          positionFilter === "all" || player.position === positionFilter;

        return matchesSearch && matchesPosition;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        } else if (sortBy === "position") {
          return a.position.localeCompare(b.position);
        } else if (sortBy === "team") {
          return a.teamName?.localeCompare(b.teamName || "") || 0;
        } else if (sortBy === "nhlTeam") {
          return (a.nhl_team || "").localeCompare(b.nhl_team || "");
        } else if (sortBy === "points") {
          // Sort descending by total_points
          return b.total_points - a.total_points;
        }
        return 0;
      });
  }, [allPlayers, searchTerm, positionFilter, sortBy]);

  // Group players by team if groupByTeam is true
  const groupedPlayers = useMemo(() => {
    if (!groupByTeam) {
      return { "All Players": filteredPlayers };
    }

    const grouped = {};
    for (const player of filteredPlayers) {
      const groupKey = groupByTeam === true ? player.teamName : player.nhl_team;
      if (!groupKey) continue;

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(player);
    }
    return grouped;
  }, [filteredPlayers, groupByTeam]);

  // Loading state
  if (teamsLoading || playersLoading) {
    return <LoadingSpinner size="large" message="Loading players data..." />;
  }

  // No data state
  if (allPlayers.length === 0) {
    return (
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-6">NHL Players</h1>
        <p className="text-gray-500">No player data available.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header section */}
      <div className="bg-gradient-to-r from-[#041E42] to-[#6D4C9F] text-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">NHL Players</h1>
        <p className="text-lg opacity-90 mb-4">
          Browse and search all fantasy hockey players
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search players or teams..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-[#6D4C9F] focus:border-[#6D4C9F]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <select
              className="w-full p-2 border border-gray-200 rounded-md focus:ring-[#6D4C9F] focus:border-[#6D4C9F]"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <option value="all">All Positions</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              className="w-full p-2 border border-gray-200 rounded-md focus:ring-[#6D4C9F] focus:border-[#6D4C9F]"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="points">Total Points</option>
              <option value="name">Player Name</option>
              <option value="team">Fantasy Team</option>
              <option value="nhlTeam">NHL Team</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="flex items-center w-full">
              <input
                type="checkbox"
                id="groupByTeam"
                checked={groupByTeam}
                onChange={(e) => setGroupByTeam(e.target.checked)}
                className="mr-2 h-4 w-4 text-[#6D4C9F] focus:ring-[#6D4C9F] border-gray-300 rounded"
              />
              <label
                htmlFor="groupByTeam"
                className="text-sm font-medium text-gray-700"
              >
                Group by Fantasy Team
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Player stats */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-wrap gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Total Players</div>
            <div className="text-xl font-bold">{allPlayers.length}</div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Filtered Players</div>
            <div className="text-xl font-bold">{filteredPlayers.length}</div>
          </div>

          {positions.map((pos) => (
            <div key={pos} className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">{pos}</div>
              <div className="text-xl font-bold">
                {allPlayers.filter((p) => p.position === pos).length}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Players List */}
      {Object.entries(groupedPlayers).length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-100">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M12 14a2 2 0 100-4 2 2 0 000 4z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-500">
            No players match your search criteria.
          </p>
        </div>
      ) : (
        Object.entries(groupedPlayers).map(([teamName, players]) => (
          <div key={teamName} className="mb-6">
            <div className="flex items-center mb-2">
              <h2 className="text-xl font-bold text-gray-800">{teamName}</h2>
              <span className="ml-2 text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                {players.length} players
              </span>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NHL Team
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Goals
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assists
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {players.map((player, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <a
                          href={`https://www.nhl.com/player/${player.nhl_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center group"
                        >
                          <div className="flex-shrink-0 h-10 w-10">
                            {player.image_url ? (
                              <img
                                src={player.image_url}
                                alt={player.name}
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-[#6D4C9F]/10 flex items-center justify-center">
                                <span className="text-xs font-medium text-[#6D4C9F]">
                                  {player.name.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-[#6D4C9F] group-hover:underline">
                              {player.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {player.position}
                            </div>
                          </div>
                        </a>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <a
                          href={`https://www.nhl.com/${player.nhlTeamUrlSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center group"
                        >
                          <div className="flex items-center">
                            {player.team_logo ? (
                              <img
                                src={player.team_logo}
                                alt={`${player.nhl_team} logo`}
                                className="h-6 w-6 mr-2"
                              />
                            ) : null}
                            <span className="text-sm text-gray-900 group-hover:text-[#6D4C9F] group-hover:underline">
                              {player.nhl_team}
                            </span>
                          </div>
                        </a>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {player.total_points}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {player.goals}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {player.assists}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PlayersPage;
