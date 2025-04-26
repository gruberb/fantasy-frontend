import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { api } from "../api/client";
import { usePlayoffsData } from "./usePlayoffsData";
import { getNHLTeamUrlSlug } from "../utils/nhlTeams";
import { PlayerWithTeam } from "../types/players";

export function usePlayers() {
  const { isTeamInPlayoffs } = usePlayoffsData();

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("points");
  const [inPlayoffsFilter, setInPlayoffsFilter] = useState("all");
  const [groupByTeam, setGroupByTeam] = useState(true);

  // Fetch teams
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: api.getTeams,
  });

  // Fetch team points for all teams
  const { data: teamPointsData, isLoading: playersLoading } = useQuery({
    queryKey: ["allTeamPlayers"],
    queryFn: async () => {
      if (!teams || !Array.isArray(teams)) return [];

      const promises = teams.map((team) => api.getTeamPoints(team.id));
      return Promise.all(promises);
    },
    enabled: !!teams && Array.isArray(teams),
  });

  // Process all players
  const allPlayers = useMemo(() => {
    if (
      !teamPointsData ||
      !Array.isArray(teamPointsData) ||
      teamPointsData.length === 0
    ) {
      return [];
    }

    const players: PlayerWithTeam[] = [];
    for (const teamData of teamPointsData) {
      if (teamData && teamData.players && Array.isArray(teamData.players)) {
        for (const player of teamData.players) {
          players.push({
            ...player,
            teamName: teamData.teamName,
            teamId: teamData.teamId,
            teamAbbreviation: player.nhlTeam || "",
            nhlTeamUrlSlug: getNHLTeamUrlSlug(player.nhlTeam || ""),
          });
        }
      }
    }
    return players;
  }, [teamPointsData]);

  // Get unique positions
  const positions = useMemo(() => {
    const posSet = new Set(allPlayers.map((player) => player.position));
    return Array.from(posSet).sort();
  }, [allPlayers]);

  // Get position counts
  const positionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allPlayers.forEach((player) => {
      counts[player.position] = (counts[player.position] || 0) + 1;
    });
    return Object.entries(counts).map(([position, count]) => ({
      position,
      count,
    }));
  }, [allPlayers]);

  // Filter players based on search, position, etc.
  const filteredPlayers = useMemo(() => {
    return allPlayers
      .filter((player) => {
        // Search filter
        const matchesSearch =
          player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.nhlTeam?.toLowerCase().includes(searchTerm.toLowerCase());

        // Position filter
        const matchesPosition =
          positionFilter === "all" || player.position === positionFilter;

        // Playoffs filter
        const matchesPlayoff =
          inPlayoffsFilter === "all" ||
          (inPlayoffsFilter === "in"
            ? isTeamInPlayoffs(player.nhlTeam || "")
            : !isTeamInPlayoffs(player.nhlTeam || ""));

        return matchesSearch && matchesPosition && matchesPlayoff;
      })
      .sort((a, b) => {
        // Sort players
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        } else if (sortBy === "position") {
          return a.position.localeCompare(b.position);
        } else if (sortBy === "team") {
          return a.teamName?.localeCompare(b.teamName || "") || 0;
        } else if (sortBy === "nhlTeam") {
          return (a.nhlTeam || "").localeCompare(b.nhlTeam || "");
        } else if (sortBy === "points") {
          return b.totalPoints - a.totalPoints;
        }
        return 0;
      });
  }, [
    allPlayers,
    searchTerm,
    positionFilter,
    sortBy,
    inPlayoffsFilter,
    isTeamInPlayoffs,
  ]);

  // Group players by team if needed
  const groupedPlayers = useMemo(() => {
    if (!groupByTeam) {
      return { "All Players": filteredPlayers };
    }

    const grouped: Record<string, PlayerWithTeam[]> = {};
    for (const player of filteredPlayers) {
      const groupKey = player.teamName || "Unknown Team";
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(player);
    }
    return grouped;
  }, [filteredPlayers, groupByTeam]);

  return {
    allPlayers,
    filteredPlayers,
    groupedPlayers,
    positions,
    positionCounts,
    isLoading: teamsLoading || playersLoading,

    // Filters
    searchTerm,
    setSearchTerm,
    positionFilter,
    setPositionFilter,
    sortBy,
    setSortBy,
    inPlayoffsFilter,
    setInPlayoffsFilter,
    groupByTeam,
    setGroupByTeam,
    isTeamInPlayoffs,
  };
}
