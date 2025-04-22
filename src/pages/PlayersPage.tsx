import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";

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
      <h1 className="text-3xl font-bold mb-6">NHL Players</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search players or teams..."
              className="w-full p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <select
              className="w-full p-2 border rounded"
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
              className="w-full p-2 border rounded"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="points">Total Points</option>
              <option value="name">Player Name</option>
              <option value="position">Position</option>
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
                className="mr-2"
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
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Total Players</div>
            <div className="text-xl font-bold">{allPlayers.length}</div>
          </div>

          <div className="bg-green-100 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Filtered Players</div>
            <div className="text-xl font-bold">{filteredPlayers.length}</div>
          </div>

          {positions.map((pos) => (
            <div key={pos} className="bg-gray-100 p-3 rounded-lg">
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
        <div className="text-center py-8">
          <p className="text-gray-500">
            No players match your search criteria.
          </p>
        </div>
      ) : (
        Object.entries(groupedPlayers).map(([teamName, players]) => (
          <div key={teamName} className="mb-6">
            <div className="flex items-center mb-2">
              <h2 className="text-xl font-bold">{teamName}</h2>
              <span className="ml-2 text-sm text-gray-500">
                ({players.length} players)
              </span>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left">Name</th>
                    <th className="py-2 px-4 text-left">Position</th>
                    <th className="py-2 px-4 text-left">NHL Team</th>
                    <th className="py-2 px-4 text-left">Points</th>
                    <th className="py-2 px-4 text-left">Goals</th>
                    <th className="py-2 px-4 text-left">Assists</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="py-2 px-4">
                        <div className="flex items-center">
                          {player.image_url ? (
                            <img
                              src={player.image_url}
                              alt={player.name}
                              className="w-10 h-10 rounded-full mr-3 object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                              <span className="text-xs font-medium">
                                {player.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="font-medium">{player.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-4">{player.position}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center">
                          {player.team_logo ? (
                            <img
                              src={player.team_logo}
                              alt={`${player.nhl_team} logo`}
                              className="w-6 h-6 mr-2"
                            />
                          ) : null}
                          <span>{player.nhl_team}</span>
                        </div>
                      </td>
                      <td className="py-2 px-4">{player.total_points}</td>
                      <td className="py-2 px-4">{player.goals}</td>
                      <td className="py-2 px-4">{player.assists}</td>
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
