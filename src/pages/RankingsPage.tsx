import RankingTable from "../components/common/RankingTable";
import { useRankingsData } from "../hooks/useRankingsData";

import { dailyRankingsColumns } from "../components/rankingsPageTableColumns/dailysColumns";
import { playoffRankingsColumns } from "../components/rankingsPageTableColumns/playoffColumns";
import { TeamStatsColumns } from "../components/rankingsPageTableColumns/teamStatsColumns";

const RankingsPage = () => {
  const {
    selectedDate,
    setSelectedDate,
    dailyRankings,
    dailyRankingsLoading,
    playoffRankings,
    playoffRankingsLoading,
    teamStats,
    teamStatsLoading,
    teamStatsError,
  } = useRankingsData();

  const teamStatsColumns = TeamStatsColumns();

  // Extract rankings from API response if needed
  let processedDailyRankings = [];
  if (dailyRankings) {
    if (Array.isArray(dailyRankings)) {
      processedDailyRankings = dailyRankings;
    } else if (
      typeof dailyRankings === "object" &&
      "rankings" in dailyRankings
    ) {
      processedDailyRankings = dailyRankings.rankings;
    } else if (
      typeof dailyRankings === "object" &&
      "data" in dailyRankings &&
      dailyRankings.data &&
      typeof dailyRankings.data === "object" &&
      "rankings" in dailyRankings.data
    ) {
      processedDailyRankings = dailyRankings.data.rankings;
    }
  }

  return (
    <div>
      <div className="mt-8">
        <RankingTable
          columns={dailyRankingsColumns}
          data={processedDailyRankings}
          keyField="teamId"
          rankField="rank"
          title="Daily Fantasy Scores"
          isLoading={dailyRankingsLoading}
          emptyMessage={"No daily rankings available for this date"}
          showDatePicker={true} // Enable date picker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          initialSortKey="dailyPoints"
          initialSortDirection="desc"
        />
      </div>

      <div className="mt-8">
        {/* Team Stats Table */}
        <RankingTable
          columns={teamStatsColumns}
          data={teamStats || []}
          keyField="teamId"
          rankField="rank"
          title="Season Overview"
          dateBadge="2024/2025 Playoffs"
          onRowClick={null}
          isLoading={teamStatsLoading}
          emptyMessage={
            teamStatsError
              ? "Failed to load team statistics"
              : "No team statistics available"
          }
          initialSortKey="totalPoints"
          initialSortDirection="desc"
        />
      </div>

      {/* Playoff Rankings */}
      <div className="mt-8">
        <RankingTable
          columns={playoffRankingsColumns}
          data={playoffRankings}
          keyField="teamId"
          rankField="rank"
          dateBadge="2024/2025 Playoffs"
          title="Playoff Stats"
          isLoading={playoffRankingsLoading}
          emptyMessage="No playoff rankings data available"
          initialSortKey="rank"
          initialSortDirection="asc"
        />
      </div>
    </div>
  );
};

export default RankingsPage;
