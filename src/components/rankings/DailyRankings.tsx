import { RankingItem } from "../../types/rankings";
import RankingTable from "../common/RankingTable";

interface DailyRankingsProps {
  isLoading: boolean;
  error: unknown;
  data: RankingItem[] | undefined;
  displayDate: Date;
  title?: string;
  limit?: number;
}

export default function DailyRankings({
  isLoading,
  error,
  data,
  displayDate,
  title = "Daily Fantasy Scores",
  limit,
}: DailyRankingsProps) {
  // Define columns for the daily rankings
  const columns = [
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

  // The error will be handled by the RankingTable's empty state
  const errorMessage = error
    ? "No daily rankings available for this date."
    : undefined;

  return (
    <RankingTable
      columns={columns}
      data={data || []}
      keyField="teamId"
      rankField="rank"
      title={title}
      limit={limit}
      isLoading={isLoading}
      emptyMessage={errorMessage || "No daily rankings data available."}
      dateBadge={displayDate}
      initialSortKey="dailyPoints"
      initialSortDirection="desc"
    />
  );
}
