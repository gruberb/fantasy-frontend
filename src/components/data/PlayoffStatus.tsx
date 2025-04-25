import React from "react";
import { usePlayoffsData } from "../../hooks/usePlayoffsData";

interface PlayoffStatusProps {
  teamAbbrevs: string[];
  showIcons?: boolean;
  label?: string;
}

const PlayoffStatus: React.FC<PlayoffStatusProps> = ({
  teamAbbrevs,
  showIcons = true,
  label = "Teams in Playoffs:",
}) => {
  const { isTeamInPlayoffs, isLoading } = usePlayoffsData();

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading playoff data...</div>;
  }

  if (!teamAbbrevs || teamAbbrevs.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No team abbreviations provided
      </div>
    );
  }

  const inPlayoffs = teamAbbrevs.filter((abbrev) => isTeamInPlayoffs(abbrev));

  if (inPlayoffs.length === 0) {
    return <div className="text-sm text-gray-500">No teams in playoffs</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="flex flex-wrap gap-1">
        {showIcons &&
          inPlayoffs.map((abbrev) => (
            <div
              key={abbrev}
              className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium border border-red-200"
            >
              {abbrev}
            </div>
          ))}
        <div className="text-sm font-bold">
          {inPlayoffs.length} / {teamAbbrevs.length}
        </div>
      </div>
    </div>
  );
};

export default PlayoffStatus;
