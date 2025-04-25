import { Link } from "react-router-dom";
import { Team } from "../../types/teams";

interface TeamCardProps {
  team: Team;
}

export default function TeamCard({ team }: TeamCardProps) {
  return (
    <Link
      to={`/teams/${team.id}`}
      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-100 hover:translate-y-px"
    >
      <div className="flex items-center space-x-4">
        {team.teamLogo ? (
          <img
            src={team.teamLogo}
            alt={`${team.name} logo`}
            className="w-16 h-16 object-contain"
          />
        ) : (
          <div className="w-16 h-16 bg-[#6D4C9F]/10 flex items-center justify-center rounded-full">
            <span className="text-xl font-bold text-[#6D4C9F]">
              {team.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-gray-800">{team.name}</h2>
          <p className="text-[#6D4C9F]">Fantasy Team</p>

          <div className="mt-2">
            <span className="text-xs text-gray-500 inline-flex items-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
