import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import DailyRankingsCard from "../components/DailyRankingsCard";
import RankingsTable from "../components/RankingsTable";
import {
  toLocalDateString,
  dateStringToLocalDate,
  formatDisplayDate,
} from "../utils/timezone";

const RankingsPage = () => {
  // Default to yesterday's date
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    // Return YYYY-MM-DD in **local** time
    return toLocalDateString(yesterday);
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
    data: dailyRankings,
    isLoading: dailyRankingsLoading,
    error: dailyRankingsError,
  } = useQuery({
    queryKey: ["dailyRankings", selectedDate],
    queryFn: () => api.getDailyFantasySummary(selectedDate),
    retry: 1,
  });

  // Build date range for the date picker
  const getDateRange = () => {
    const dates = [];
    const today = new Date(); // local
    for (let i = -14; i <= 0; i++) {
      // Create a local date offset by i days from 'today'
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Convert to local YYYY-MM-DD
      const dateString = toLocalDateString(date);

      const isToday = i === 0;
      const isYesterday = i === -1;

      dates.push({
        value: dateString,
        label: isToday
          ? "Today"
          : isYesterday
            ? "Yesterday"
            : toLocalDateString(date),
        isToday,
        isYesterday,
      });
    }
    return dates;
  };

  const addDaysToDateString = (dateString: string, days: number): string => {
    const date = dateStringToLocalDate(dateString); // get local date
    date.setDate(date.getDate() + days); // add (or subtract) days in local time
    return toLocalDateString(date); // convert back to YYYY-MM-DD
  };

  const removeDaysFromString = (dateString: string, days: number): string => {
    const date = dateStringToLocalDate(dateString); // get local date
    date.setDate(date.getDate() - days); // add (or subtract) days in local time
    return toLocalDateString(date); // convert back to YYYY-MM-DD
  };

  const dateRange = getDateRange();
  const displayDate = dateStringToLocalDate(selectedDate);

  // Format date for display
  const formattedDisplayDate = formatDisplayDate(
    dateStringToLocalDate(selectedDate),
  );

  return (
    <div>
      {/* Header section */}
      <div className="bg-gradient-to-r from-[#041E42] to-[#6D4C9F] text-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2 pb-2">Fantasy NHL Rankings</h1>
        <p className="text-lg opacity-90 mb-4">
          Check out daily scores and how the Playoffs overall go for each
          fantasy team.
        </p>
        <div className="bg-white/10 p-2 m-2 rounded-lg shadow-sm mb-6 border border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Date header */}
            <h2 className="text-lg md:text-xl font-medium mb-4 md:mb-0">
              {formattedDisplayDate}
            </h2>
            {/* Date controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const prevDate = removeDaysFromString(selectedDate, 1);
                  setSelectedDate(prevDate);
                }}
                className="p-1 md:p-2 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
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
                className="p-1 md:p-2 bg-white/10 border border-white/20 rounded-md text-center text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                {dateRange.map((date) => (
                  <option key={date.value} value={date.value}>
                    {date.isToday ? `Today` : date.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  const nextDate = addDaysToDateString(selectedDate, 1);
                  setSelectedDate(nextDate);
                }}
                className="p-1 md:p-2 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Next day"
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

              <button
                onClick={() => setSelectedDate(toLocalDateString(new Date()))}
                className="ml-2 px-2 md:px-3 py-1 md:py-2 bg-white/10 border border-white/20 text-white rounded-md hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                Today
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Fantasy Scores */}
      {dailyRankingsLoading ? (
        <LoadingSpinner message="Loading daily rankings..." />
      ) : dailyRankingsError ? (
        <div className="card">
          <ErrorMessage message="Failed to load daily rankings. Please try again." />
        </div>
      ) : (
        <DailyRankingsCard
          rankings={dailyRankings || []}
          date={displayDate}
          title="Daily Fantasy Scores"
          limit={100}
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
          <div className="card overflow-x-auto">
            <RankingsTable rankings={rankings} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingsPage;
