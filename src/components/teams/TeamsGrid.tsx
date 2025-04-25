import { Team } from "../../types/teams";
import TeamCard from "./TeamCard";
import EmptyTeamsState from "./EmptyTeamsState";

interface TeamsGridProps {
  teams: Team[];
}

export default function TeamsGrid({ teams }: TeamsGridProps) {
  if (teams.length === 0) {
    return <EmptyTeamsState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
