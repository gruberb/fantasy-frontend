interface TeamsHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function TeamsHeader({
  searchTerm,
  setSearchTerm,
}: TeamsHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-[#041E42] to-[#6D4C9F] text-white rounded-lg shadow-md p-6 mb-6">
      <h1 className="text-3xl font-bold mb-2">Fantasy Teams</h1>
      <p className="text-lg opacity-90 mb-4">
        View and manage your fantasy hockey teams
      </p>

      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50"
        />
      </div>
    </div>
  );
}
