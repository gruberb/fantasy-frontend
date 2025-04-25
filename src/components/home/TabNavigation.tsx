interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TabNavigation({
  activeTab,
  setActiveTab,
}: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8">
        <button
          onClick={() => setActiveTab("rankings")}
          className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
            activeTab === "rankings"
              ? "border-[#6D4C9F] text-[#6D4C9F]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Overall Ranking
        </button>
        <button
          onClick={() => setActiveTab("games")}
          className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
            activeTab === "games"
              ? "border-[#6D4C9F] text-[#6D4C9F]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Today's Games
        </button>
        <button
          onClick={() => setActiveTab("players")}
          className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
            activeTab === "players"
              ? "border-[#6D4C9F] text-[#6D4C9F]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Top Skaters
        </button>
      </nav>
    </div>
  );
}
