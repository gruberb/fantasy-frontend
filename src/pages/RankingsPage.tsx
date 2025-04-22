import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import DailyRankingsCard from "../components/DailyRankingsCard";

const RankingsPage = () => {
  // State for date selector
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0]; // Default to yesterday
  });

  // Fetch rankings with default parameters
  const {
    data: rankings,
    isLoading: rankingsLoading,
    error: rankingsError,
  } = useQuery({
    queryKey: ["rankings"],
    queryFn: () => api.getRankings(),
  });

  // Fetch daily rankings for the selected date
  const {
    data: dailyRankings,
    isLoading: dailyRankingsLoading,
    error: dailyRankingsError,
  } = useQuery({
    queryKey: ["dailyRankings", selectedDate],
    queryFn: () => api.getDailyFantasySummary(selectedDate),
  });

  // Loading state
  if (rankingsLoading && dailyRankingsLoading) {
    return <LoadingSpinner size="large" message="Loading rankings..." />;
  }

  // Error state
  if ((rankingsError && dailyRankingsError) || (!rankings && !dailyRankings)) {
    return (
      <ErrorMessage message="Failed to load rankings. Please try again." />
    );
  }

  // Helper to calculate date range for the date picker
  const getDateRange = () => {
    const dates = [];
    const today = new Date();

    // Add dates from 14 days ago to today
    for (let i = -14; i <= 0; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateString = date.toISOString().split("T")[0];
      const isToday = i === 0;
      const isYesterday = i === -1;

      dates.push({
        value: dateString,
        label: isToday
          ? "Today"
          : isYesterday
            ? "Yesterday"
            : date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              }),
        isToday,
        isYesterday,
      });
    }

    return dates;
  };

  const dateRange = getDateRange();
  const displayDate = new Date(selectedDate);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">NHL Rankings</h1>

      {/* Date selector for daily rankings */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h2 className="text-xl font-medium mb-4 md:mb-0">
            Daily Fantasy Scores
          </h2>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const prevDate = new Date(selectedDate);
                prevDate.setDate(prevDate.getDate() - 1);
                setSelectedDate(prevDate.toISOString().split("T")[0]);
              }}
              className="p-2 rounded-md bg-gray-200 hover:bg-gray-300"
              aria-label="Previous day"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 border rounded-md"
            >
              {dateRange.map((date) => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                const nextDate = new Date(selectedDate);
                nextDate.setDate(nextDate.getDate() + 1);
                const today = new Date().toISOString().split("T")[0];
                // Don't allow selecting future dates
                if (nextDate.toISOString().split("T")[0] <= today) {
                  setSelectedDate(nextDate.toISOString().split("T")[0]);
                }
              }}
              className="p-2 rounded-md bg-gray-200 hover:bg-gray-300"
              aria-label="Next day"
              disabled={selectedDate === new Date().toISOString().split("T")[0]}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Rankings */}
      {dailyRankingsLoading ? (
        <LoadingSpinner message="Loading daily rankings..." />
      ) : dailyRankingsError ? (
        <ErrorMessage message="Failed to load daily rankings. Please try again." />
      ) : (
        <DailyRankingsCard
          rankings={dailyRankings || []}
          date={displayDate}
          title="Daily Fantasy Scores"
          limit={0} // Show all
        />
      )}

      {/* Season Rankings Table */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Season Rankings</h2>
        {rankingsLoading ? (
          <LoadingSpinner message="Loading season rankings..." />
        ) : rankingsError ? (
          <ErrorMessage message="Failed to load season rankings. Please try again." />
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Rank</th>
                  <th className="py-3 px-4 text-left">Team</th>
                  <th className="py-3 px-4 text-left">Points</th>
                  <th className="py-3 px-4 text-left">Goals</th>
                  <th className="py-3 px-4 text-left">Assists</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rankings?.map((team) => (
                  <tr key={team.team_id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold">{team.rank}</td>
                    <td className="py-3 px-4">{team.team_name}</td>
                    <td className="py-3 px-4">{team.total_points}</td>
                    <td className="py-3 px-4">{team.goals}</td>
                    <td className="py-3 px-4">{team.assists}</td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/teams/${team.team_id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View Team
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingsPage;
