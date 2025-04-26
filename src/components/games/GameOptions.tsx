interface GameOptionsProps {
  hasLiveGames: boolean;
  autoRefresh: boolean;
  setAutoRefresh: (value: boolean) => void;
  onRefresh: () => void;
}

export default function GameOptions({
  hasLiveGames,
  autoRefresh,
  setAutoRefresh,
  onRefresh,
}: GameOptionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      {/* Live update toggle */}
      {hasLiveGames && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoRefresh"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="autoRefresh" className="text-sm text-gray-700">
            Auto-refresh live games
          </label>
          {autoRefresh && (
            <div
              className="ml-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"
              title="Refreshing every 30 seconds"
            ></div>
          )}
        </div>
      )}

      {/* Manual refresh button */}
      <button
        onClick={onRefresh}
        className="ml-auto px-3 py-1 bg-[#6D4C9F]/10 text-[#6D4C9F] rounded hover:bg-[#6D4C9F]/20 flex items-center"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Refresh Data
      </button>
    </div>
  );
}
