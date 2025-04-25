interface AutoRefreshIndicatorProps {
  autoRefresh: boolean;
}

export default function AutoRefreshIndicator({
  autoRefresh,
}: AutoRefreshIndicatorProps) {
  if (!autoRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-[#6D4C9F] text-white py-2 px-4 rounded-full shadow-lg flex items-center text-sm animate-pulse">
      <svg
        className="w-4 h-4 mr-2 animate-spin"
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
      Live Updates Active
    </div>
  );
}
