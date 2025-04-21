import { Link } from "react-router-dom";
import { Game, Team } from "../api/client";

interface GamesListProps {
  games: Game[];
  teams: Team[];
  title?: string;
  showDate?: boolean;
  limit?: number;
}

// Helper function to format date/time
const formatDateTime = (dateTimeStr: string) => {
  const date = new Date(dateTimeStr);
  return {
    date: date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

// Helper to get status class
const getStatusClass = (status: string) => {
  switch (status) {
    case "LIVE":
      return "bg-red-100 text-red-800";
    case "FINAL":
      return "bg-gray-100 text-gray-800";
    case "SCHEDULED":
      return "bg-green-100 text-green-800";
    case "POSTPONED":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

const GamesList = ({
  games,
  teams,
  title = "Today's Games",
  showDate = true,
  limit,
}: GamesListProps) => {
  // Apply limit if provided
  const displayGames = limit ? games.slice(0, limit) : games;

  if (displayGames.length === 0) {
    return (
      <div>
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        <p className="text-gray-500">No games scheduled.</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          {limit && games.length > limit && (
            <Link to="/games" className="text-blue-600 hover:underline">
              View All →
            </Link>
          )}
        </div>
      )}

      <div className="space-y-4">
        {displayGames.map((game) => {
          const homeTeam = teams.find((t) => t.id === game.home_team_id);
          const awayTeam = teams.find((t) => t.id === game.away_team_id);
          const { date, time } = formatDateTime(game.start_time);

          return (
            <div
              key={game.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Game header */}
              <div className="bg-gray-50 p-3 flex justify-between items-center">
                <div>
                  {showDate && (
                    <div className="text-sm text-gray-500">{date}</div>
                  )}
                  <div className="font-medium">{time}</div>
                </div>

                <div className="flex items-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(game.status)}`}
                  >
                    {game.status}
                  </span>
                </div>
              </div>

              {/* Game content */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  {/* Away team */}
                  <Link
                    to={`/teams/${awayTeam?.id}`}
                    className="flex items-center hover:underline"
                  >
                    <div className="text-center mr-2">
                      {awayTeam?.logo ? (
                        <img
                          src={awayTeam.logo}
                          alt={`${awayTeam.name} logo`}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 flex items-center justify-center rounded-full">
                          <span className="text-xs font-bold text-gray-500">
                            {awayTeam?.abbreviation}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="font-medium">
                      {awayTeam?.name || "Unknown"}
                    </div>
                    {game.away_score !== undefined && (
                      <div className="ml-2 text-xl font-bold">
                        {game.away_score}
                      </div>
                    )}
                  </Link>

                  {/* VS */}
                  <div className="text-sm font-bold text-gray-400 mx-2">@</div>

                  {/* Home team */}
                  <Link
                    to={`/teams/${homeTeam?.id}`}
                    className="flex items-center hover:underline"
                  >
                    <div className="font-medium">
                      {homeTeam?.name || "Unknown"}
                    </div>
                    {game.home_score !== undefined && (
                      <div className="ml-2 text-xl font-bold">
                        {game.home_score}
                      </div>
                    )}
                    <div className="text-center ml-2">
                      {homeTeam?.logo ? (
                        <img
                          src={homeTeam.logo}
                          alt={`${homeTeam.name} logo`}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 flex items-center justify-center rounded-full">
                          <span className="text-xs font-bold text-gray-500">
                            {homeTeam?.abbreviation}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GamesList;
