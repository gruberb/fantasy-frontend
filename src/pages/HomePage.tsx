import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import RankingsTable from "../components/RankingsTable";
import GamesList from "../components/GamesList";
import PointsChart from "../components/PointsChart";

const HomePage = () => {
  // Fetch data for the dashboard
  const {
    data: teams,
    isLoading: teamsLoading,
    error: teamsError,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: api.getTeams,
  });

  const {
    data: rankings,
    isLoading: rankingsLoading,
    error: rankingsError,
  } = useQuery({
    queryKey: ["rankings"],
    queryFn: () => api.getRankings(),
  });

  const {
    data: todaysGamesData,
    isLoading: gamesLoading,
    error: gamesError,
    refetch: refetchGames,
  } = useQuery({
    queryKey: ["todaysGames"],
    queryFn: () => api.getTodaysGames(),
    retry: 1, // Only retry once to avoid excessive retries
  });

  // Loading state - show partial content while loading
  if (teamsLoading && rankingsLoading && gamesLoading) {
    return <LoadingSpinner size="large" message="Loading dashboard data..." />;
  }

  // Critical error - if everything failed
  if (
    (teamsError && rankingsError && gamesError) ||
    (!teams && !rankings && !todaysGamesData)
  ) {
    return (
      <ErrorMessage message="Failed to load dashboard data. Please try again." />
    );
  }

  // Get games from data if available
  const games = todaysGamesData?.games || [];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-6">Fantasy NHL Dashboard</h1>
        <p className="text-lg text-gray-600 mb-4">
          Welcome to your Fantasy NHL Dashboard. Track teams, players, games,
          and rankings all in one place.
        </p>
      </section>

      {/* Teams Overview */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Teams Overview</h2>
        {teamsLoading ? (
          <LoadingSpinner message="Loading teams..." />
        ) : teamsError ? (
          <ErrorMessage message="Could not load teams data." />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/teams" className="btn btn-primary text-center">
                View All Teams
              </Link>
              <Link to="/players" className="btn btn-primary text-center">
                View All Players
              </Link>
              <Link to="/games" className="btn btn-primary text-center">
                View Games
              </Link>
              <Link to="/rankings" className="btn btn-primary text-center">
                View Rankings
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm font-medium mb-1">Fantasy Teams</div>
                <div className="text-2xl font-bold">{teams?.length || 0}</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-medium mb-1">Today's Games</div>
                <div className="text-2xl font-bold">{games?.length || 0}</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm font-medium mb-1">Current Season</div>
                <div className="text-2xl font-bold">2024-2025</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm font-medium mb-1">Top Team</div>
                <div className="text-2xl font-bold">
                  {rankings && rankings.length > 0
                    ? rankings.sort((a, b) => a.rank - b.rank)[0].team_name
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Rankings Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Team Rankings</h2>
          <Link to="/rankings" className="text-blue-600 hover:underline">
            View All Rankings →
          </Link>
        </div>

        {rankingsLoading ? (
          <LoadingSpinner message="Loading rankings..." />
        ) : rankingsError ? (
          <ErrorMessage message="Could not load rankings data." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold mb-4">Top Teams</h3>
              <RankingsTable rankings={rankings} title="" limit={7} />
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold mb-4">Points Comparison</h3>
              <PointsChart rankings={rankings} limit={7} />
            </div>
          </div>
        )}
      </section>

      {/* Today's Games Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Today's Games</h2>
          <Link to="/games" className="text-blue-600 hover:underline">
            View All Games →
          </Link>
        </div>

        {gamesLoading ? (
          <LoadingSpinner message="Loading games..." />
        ) : gamesError ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <ErrorMessage message="Could not load today's games." />
            <div className="mt-4 text-center">
              <Link
                to="/games"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View Games Calendar
              </Link>
            </div>
          </div>
        ) : games.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">No games scheduled for today.</p>
            <Link
              to="/games"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              View Games Calendar
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-4">
            <GamesList games={games} teams={teams || []} title="" limit={4} />
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
