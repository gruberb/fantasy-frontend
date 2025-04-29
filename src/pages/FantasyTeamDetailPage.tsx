import { useParams } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import TeamHeader from "../components/teamDetail/TeamHeader";
import TeamStats from "../components/teamDetail/TeamStats";
import PlayoffStatus from "../components/teamDetail/PlayoffStatus";
import PlayerRoster from "../components/teamDetail/PlayerRoster";
import TeamBetsTable from "../components/teamDetail/TeamBetsTable";
import { useTeamDetail } from "../hooks/useTeamDetail";

const FantasyTeamDetailPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const id = parseInt(teamId || "0", 10);

  const {
    team,
    teamPoints,
    processedPlayers,
    currentTeamBets,
    playoffStats,
    isLoading,
    hasError,
  } = useTeamDetail(id);

  // Early return for loading state
  if (isLoading) {
    return <LoadingSpinner size="large" message="Loading team data..." />;
  }

  if (hasError || !team || !teamPoints) {
    return <ErrorMessage message="Team not found or data unavailable" />;
  }

  // Error handling
  if (hasError) {
    return <ErrorMessage message="Team not found or data unavailable" />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Team header with navigation */}
      <TeamHeader team={team} teamPoints={teamPoints} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Team Stats */}
        <TeamStats teamPoints={teamPoints} />

        {/* Playoff Stats Section */}
        <PlayoffStatus
          teamsInPlayoffs={playoffStats.teamsInPlayoffs}
          playersInPlayoffs={playoffStats.playersInPlayoffs}
          totalTeams={currentTeamBets.length}
          totalPlayers={processedPlayers.length}
        />

        {/* Player Roster */}
        <PlayerRoster players={processedPlayers} />

        {/* Team Bets Table */}
        <TeamBetsTable teamBets={currentTeamBets} />
      </div>
    </div>
  );
};

export default FantasyTeamDetailPage;
