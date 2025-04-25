import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import TeamsHeader from "../components/teams/TeamsHeader";
import TeamsGrid from "../components/teams/TeamsGrid";
import { useTeams } from "../hooks/useTeams";

const TeamsPage = () => {
  const { teams, isLoading, error, searchTerm, setSearchTerm } = useTeams();

  // Loading state
  if (isLoading) {
    return <LoadingSpinner size="large" message="Loading teams..." />;
  }

  // Error state
  if (error) {
    return <ErrorMessage message="Failed to load teams. Please try again." />;
  }

  return (
    <div>
      {/* Page header with search */}
      <TeamsHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Teams grid */}
      <TeamsGrid teams={teams} />
    </div>
  );
};

export default TeamsPage;
