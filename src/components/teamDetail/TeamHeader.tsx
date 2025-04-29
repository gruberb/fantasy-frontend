import { NHLTeam } from "../../types/fantasyTeams";
import { FantasyTeamPoints } from "../../types/fantasyTeams";
import { Link } from "react-router-dom";

interface TeamHeaderProps {
  team: NHLTeam;
  teamPoints: FantasyTeamPoints;
}

export default function TeamHeader({ team, teamPoints }: TeamHeaderProps) {
  return (
    <>
      <div className="mb-4">
        <Link to="/fantasy-teams" className="btn btn-secondary">
          ← Fantasy Teams Overview
        </Link>
      </div>

      <div className="flex items-center space-x-4 mb-8">
        {team.teamLogo ? (
          <img
            src={team.teamLogo}
            alt={`${team.name} logo`}
            className="w-24 h-24 object-contain"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-full">
            <span className="text-3xl font-bold text-gray-500">
              {team.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-xl text-gray-600">Fantasy Team</p>
          <p className="text-lg text-gray-500">
            Total Points: {teamPoints.teamTotals.totalPoints}
          </p>
        </div>
      </div>
    </>
  );
}
