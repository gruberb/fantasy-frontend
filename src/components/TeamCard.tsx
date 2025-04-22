import { Link } from "react-router-dom";
import { Team } from "../api/client";

interface TeamCardProps {
  team: Team;
  stats?: {
    points?: number;
    wins?: number;
    losses?: number;
    otLosses?: number;
    rank?: number;
  };
  className?: string;
}

const TeamCard = ({ team, stats, className = "" }: TeamCardProps) => {
  return (
    <Link to={`/teams/${team.id}`} className={`card ${className}`}>
      <div className="flex items-center space-x-4">
        {team.team_logo ? (
          <img
            src={team.team_logo}
            alt={`${team.name} logo`}
            className="w-16 h-16 object-contain"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-full">
            <span className="text-xl font-bold text-gray-500">
              {team.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold">{team.name}</h2>
          {team.abbreviation && (
            <p className="text-gray-600">{team.abbreviation}</p>
          )}

          {stats && (
            <div className="mt-2 text-sm text-gray-700">
              {stats.rank !== undefined && <div>Rank: #{stats.rank}</div>}
              {stats.points !== undefined && <div>Points: {stats.points}</div>}
              {stats.wins !== undefined &&
                stats.losses !== undefined &&
                stats.otLosses !== undefined && (
                  <div>
                    Record: {stats.wins}W - {stats.losses}L - {stats.otLosses}
                    OTL
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TeamCard;
