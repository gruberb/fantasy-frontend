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
      {/* Teams grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTeams.map((team) => (
          <Link to={`/teams/${team.id}`} key={team.id} className="card">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-full">
                <span className="text-xl font-bold text-gray-500">
                  {team.name.substring(0, 2).toUpperCase()}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold">{team.name}</h2>
                <p className="text-gray-600">Fantasy Team</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No teams match your search.</p>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
