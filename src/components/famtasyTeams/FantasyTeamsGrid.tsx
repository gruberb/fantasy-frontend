import { NHLTeam } from "../../types/fantasyTeams";
import FantasyTeamCard from "./FantasyTeamCard";
import FantasyEmptyTeamsState from "./EmptyFantasyTeamsState";

interface FantasyTeamsGridProps {
  teams: NHLTeam[];
}

export default function TeamsGrid({ teams }: FantasyTeamsGridProps) {
  if (teams.length === 0) {
    return <FantasyEmptyTeamsState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {teams.map((team) => (
        <FantasyTeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
