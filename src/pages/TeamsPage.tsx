import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

const TeamsPage = () => {
  // State for filtering teams
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch teams
  const {
    data: teams,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: api.getTeams,
  });

  // Loading state
  if (isLoading) {
    return <LoadingSpinner size="large" message="Loading teams..." />;
  }

  // Error state
  if (error || !teams) {
    return <ErrorMessage message="Failed to load teams. Please try again." />;
  }

  // Ensure teams is an array
  const teamsArray = Array.isArray(teams) ? teams : [];

  // Filter teams based on search term
  const filteredTeams = teamsArray.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      {/* Page header with search */}
      <div className="bg-gradient-to-r from-[#041E42] to-[#6D4C9F] text-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">Fantasy Teams</h1>
        <p className="text-lg opacity-90 mb-4">
          View and manage your fantasy hockey teams
        </p>

        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {/* Teams grid */}
      {filteredTeams.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-100">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M12 14a2 2 0 100-4 2 2 0 000 4z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-500">No teams match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTeams.map((team) => (
            <Link
              to={`/teams/${team.id}`}
              key={team.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-100 hover:translate-y-px"
            >
              <div className="flex items-center space-x-4">
                {team.team_logo ? (
                  <img
                    src={team.team_logo}
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
                  <h2 className="text-xl font-bold text-gray-800">
                    {team.name}
                  </h2>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
