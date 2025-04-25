import LoadingSpinner from "../components/common/LoadingSpinner";
import PlayersHeader from "../components/players/PlayersHeader";
import PlayerStatsOverview from "../components/players/PlayerStatsOverview";
import PlayerTeamSection from "../components/players/PlayerTeamSection";
import EmptyPlayersState from "../components/players/EmptyPlayersState";
import { usePlayers } from "../hooks/usePlayers";

const PlayersPage = () => {
  const {
    allPlayers,
    filteredPlayers,
    groupedPlayers,
    positions,
    positionCounts,
    isLoading,
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
  } = usePlayers();

  // Loading check
  if (isLoading) {
    return <LoadingSpinner size="large" message="Loading players data..." />;
  }

  // No data check
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
      {/* Header section with filters */}
      <PlayersHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        positionFilter={positionFilter}
        setPositionFilter={setPositionFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        positions={positions}
        inPlayoffsFilter={inPlayoffsFilter}
        setInPlayoffsFilter={setInPlayoffsFilter}
        groupByTeam={groupByTeam}
        setGroupByTeam={setGroupByTeam}
      />

      {/* Player stats overview */}
      <PlayerStatsOverview
        totalPlayers={allPlayers.length}
        filteredPlayers={filteredPlayers.length}
        positionCounts={positionCounts}
      />

      {/* Players List */}
      {Object.entries(groupedPlayers).length === 0 ? (
        <EmptyPlayersState />
      ) : (
        Object.entries(groupedPlayers).map(([teamName, players]) => (
          <PlayerTeamSection
            key={teamName}
            teamName={teamName}
            players={players}
            playersInPlayoffs={
              players.filter((p) => isTeamInPlayoffs(p.nhlTeam || "")).length
            }
            isTeamInPlayoffs={isTeamInPlayoffs}
          />
        ))
      )}
    </div>
  );
};

export default PlayersPage;
