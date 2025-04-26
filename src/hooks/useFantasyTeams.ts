import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { FantasyTeamCount } from "../types/fantasy";
import { PlayerWithPoints } from "../types/players";

export function useFantasyTeams(selectedDate: string) {
  // 1. Fetch raw data
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: api.getTeams,
  });

  const { data: gamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ["games", selectedDate],
    queryFn: () => api.getGames(selectedDate),
  });

  // 2. Compute `fantasyTeamCounts` whenever teams or gamesData change
  const fantasyTeamCounts: FantasyTeamCount[] = useMemo(() => {
    if (!teams || !gamesData?.games) return [];

    // build name→id map
    const nameToId = teams.reduce<Record<string, number>>((acc, t) => {
      acc[t.name] = t.id;
      acc[t.name.toLowerCase()] = t.id;
      if (t.abbreviation) {
        acc[t.abbreviation] = t.id;
        acc[t.abbreviation.toLowerCase()] = t.id;
      }
      return acc;
    }, {});

    // init counts
    const map = new Map<number, FantasyTeamCount>();
    teams.forEach((t) =>
      map.set(t.id, {
        teamId: t.id,
        teamName: t.name,
        teamLogo: t.teamLogo,
        playerCount: 0,
        players: [],
        totalPoints: 0,
      }),
    );

    // helper to process one player list
    const processPlayers = (
      players: PlayerWithPoints[] = [],
      gameId: number,
      nhlTeam: string,
      logo: string,
    ) => {
      players.forEach((p) => {
        const key = p.fantasyTeam;
        if (!key) return;
        const teamId = nameToId[key] ?? nameToId[key.toLowerCase()];
        const entry =
          teamId !== undefined
            ? map.get(teamId)!
            : (map.get(-1) ?? {
                teamId: -1,
                teamName: key,
                playerCount: 0,
                players: [],
                totalPoints: 0,
              });

        // push back into map if newly created
        if (!map.has(entry.teamId)) map.set(entry.teamId, entry);

        // update counts
        entry.playerCount++;
        const pts = typeof p.points === "number" ? p.points : 0;
        entry.totalPoints += pts;
        entry.players.push({ ...p, gameId, nhlTeam, teamLogo: logo });
      });
    };

    // walk through each game
    for (const g of gamesData.games) {
      processPlayers(g.homeTeamPlayers, g.id, g.homeTeam, g.homeTeamLogo ?? "");
      processPlayers(g.awayTeamPlayers, g.id, g.awayTeam, g.awayTeamLogo ?? "");
    }

    // sort players inside each team
    map.forEach((t) =>
      t.players.sort((a, b) => (b.points || 0) - (a.points || 0)),
    );

    // return only teams with at least one player
    return Array.from(map.values()).filter((t) => t.playerCount > 0);
  }, [teams, gamesData]);

  const isLoading = teamsLoading || gamesLoading;

  return {
    gamesData,
    teams,
    fantasyTeamCounts,
    isLoading,
    teamsLoading,
    gamesLoading,
  };
}
