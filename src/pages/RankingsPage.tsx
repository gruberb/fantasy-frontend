import DatePickerHeader from "../components/common/DatePickerHeader";
import DailyRankings from "../components/rankings/DailyRankings";
import SeasonRankings from "../components/rankings/SeasonRankings";
import PlayoffRankingsTable from "../components/rankings/PlayoffsRankingTable";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useRankingsData } from "../hooks/useRankingsData";

const RankingsPage = () => {
  const {
    selectedDate,
    setSelectedDate,
    displayDate,
    rankings,
    rankingsLoading,
    rankingsError,
    dailyRankings,
    dailyRankingsLoading,
    dailyRankingsError,
    playoffRankings,
    playoffRankingsLoading,
  } = useRankingsData();

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
      <DailyRankings
        isLoading={dailyRankingsLoading}
        error={dailyRankingsError}
        data={dailyRankings}
        displayDate={displayDate}
      />

      {/* Season Rankings Table */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Season Rankings</h2>
        <SeasonRankings
          isLoading={rankingsLoading}
          error={rankingsError}
          data={rankings}
        />
      </div>

      {/* Playoff Rankings */}
      <div className="mt-8">
        {playoffRankingsLoading ? (
          <LoadingSpinner message="Loading playoff rankings..." />
        ) : (
          <PlayoffRankingsTable playoffRankings={playoffRankings} />
        )}
      </div>
    </div>
  );
};

export default RankingsPage;
