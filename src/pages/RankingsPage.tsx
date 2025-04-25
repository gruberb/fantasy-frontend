import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import DailyRankingsCard from "../components/DailyRankingsCard";
import RankingsTable from "../components/RankingsTable";
import DatePickerHeader from "../components/DatePickerHeader";
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

  const displayDate = dateStringToLocalDate(selectedDate);

  return (
    <div>
      {/* Header section */}
      <DatePickerHeader
        title="Fantasy NHL Rankings"
        subtitle="Check out daily scores and how the Playoffs overall go for each fantasy team."
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

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
