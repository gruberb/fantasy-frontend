import DatePickerHeader from "../components/common/DatePickerHeader";
import RankingTable from "../components/common/RankingTable";
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

  // Define columns for daily rankings
  const dailyColumns = [
    {
      key: "rank",
      header: "Rank",
      sortable: true,
    },
    {
      key: "teamName",
      header: "Team",
      className: "font-medium",
      sortable: true,
    },
    {
      key: "dailyGoals",
      header: "Goals",
      className: "font-semibold whitespace-nowrap",
      sortable: true,
    },
    {
      key: "dailyAssists",
      header: "Assists",
      className: "font-semibold whitespace-nowrap",
      sortable: true,
    },
    {
      key: "dailyPoints",
      header: "Points",
      className: "font-semibold whitespace-nowrap",
      sortable: true,
    },
    {
      key: "playerHighlights",
      header: "Top Player",
      render: (playerHighlights: any[]) => {
        if (!playerHighlights || playerHighlights.length === 0) {
          return <span className="text-gray-400">None</span>;
        }

        const player = playerHighlights[0];

        return (
          <div className="flex items-center">
            {player.imageUrl ? (
              <img
                src={player.imageUrl}
                alt={player.playerName}
                className="w-8 h-8 rounded-full mr-2"
              />
            ) : (
              <div className="w-8 h-8 bg-[#6D4C9F]/10 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-medium text-[#6D4C9F]">
                  {player.playerName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              {player.nhlId ? (
                <a
                  href={`https://www.nhl.com/player/${player.nhlId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 hover:text-[#6D4C9F] hover:underline flex items-center font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="hidden md:inline">{player.playerName}</span>
                  <span className="md:hidden">
                    {(() => {
                      const nameParts = player.playerName.split(" ");
                      return nameParts.length >= 2
                        ? `${nameParts[1]} ${nameParts[0].charAt(0)}.`
                        : player.playerName;
                    })()}
                  </span>
                </a>
              ) : (
                <div className="font-medium text-gray-900">
                  <span className="hidden md:inline">{player.playerName}</span>
                  <span className="md:hidden">
                    {(() => {
                      const nameParts = player.playerName.split(" ");
                      return nameParts.length >= 2
                        ? `${nameParts[1]} ${nameParts[0].charAt(0)}.`
                        : player.playerName;
                    })()}
                  </span>
                </div>
              )}
              <div className="text-xs text-gray-500">{player.points} pts</div>
            </div>
          </div>
        );
      },
    },
  ];

  // Define columns for season rankings
  const seasonColumns = [
    {
      key: "rank",
      header: "Rank",
      sortable: true,
    },
    {
      key: "teamName",
      header: "Team",
      className: "font-medium",
      sortable: true,
    },
    {
      key: "goals",
      header: "Goals",
      sortable: true,
    },
    {
      key: "assists",
      header: "Assists",
      sortable: true,
    },
    {
      key: "totalPoints",
      header: "Points",
      className: "font-bold",
      sortable: true,
    },
  ];

  // Define columns for playoff rankings
  const playoffColumns = [
    {
      key: "rank",
      header: "Rank",
      // Use index as rank
      render: (_value: any, _row: any, index: number) => index + 1,
    },
    {
      key: "teamName",
      header: "Team",
      className: "font-medium",
      sortable: true,
    },
    {
      key: "playersInPlayoffs",
      header: "Players in Playoffs",
      render: (_value: any, row: any) => (
        <div className="flex items-center">
          <span className="mr-2">
            {row.playersInPlayoffs} / {row.totalPlayers}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "teamsInPlayoffs",
      header: "Teams in Playoffs",
      render: (_value: any, row: any) => (
        <div className="flex items-center">
          <span className="mr-2">
            {row.teamsInPlayoffs} / {row.totalTeams}
          </span>
        </div>
      ),
      sortable: true,
    },
  ];

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
      {/* Header section */}
      <DatePickerHeader
        title="Fantasy NHL Rankings"
        subtitle="Check out daily scores and how the Playoffs overall go for each fantasy team."
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Daily Fantasy Scores */}
      <RankingTable
        columns={dailyColumns}
        data={processedDailyRankings}
        keyField="teamId"
        rankField="rank"
        title="Daily Fantasy Scores"
        isLoading={dailyRankingsLoading}
        emptyMessage={"No daily rankings available for this date"}
        dateBadge={displayDate}
        initialSortKey="dailyPoints"
        initialSortDirection="desc"
      />

      {/* Season Rankings Table */}
      <div className="mt-8">
        <RankingTable
          columns={seasonColumns}
          data={Array.isArray(rankings) ? rankings : []}
          keyField="teamId"
          rankField="rank"
          title="Overall Rankings"
          dateBadge="2024/2025 Playoffs"
          isLoading={rankingsLoading}
          emptyMessage={
            rankingsError
              ? "Failed to load season rankings"
              : "No rankings data available"
          }
          initialSortKey="totalPoints"
          initialSortDirection="desc"
        />
      </div>

      {/* Playoff Rankings */}
      <div className="mt-8">
        <RankingTable
          columns={playoffColumns}
          data={playoffRankings}
          keyField="teamId"
          rankField="rank"
          dateBadge="2024/2025 Playoffs"
          title="Players and Teams still active"
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
