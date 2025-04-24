import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import DailyRankingsCard from "../components/DailyRankingsCard";
import RankingsTable from "../components/RankingsTable";
import { toLocalDateString, dateStringToLocalDate } from "../utils/timezone";

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

  const dateRange = getDateRange();
  console.log("selected date", selectedDate);
  const displayDate = dateStringToLocalDate(selectedDate);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header section */}
      <div className="bg-gradient-to-r from-[#041E42] to-[#6D4C9F] text-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">Fantasy NHL Rankings</h1>
        <p className="text-lg opacity-90 mb-4">
          Check out the latest fantasy NHL team and player rankings.
        </p>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-2 border border-gray-200 rounded-md focus:ring-[#6D4C9F] focus:border-[#6D4C9F]"
        >
          {dateRange.map((date) => (
            <option key={date.value} value={date.value}>
              {date.label}
            </option>
          ))}
        </select>
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
