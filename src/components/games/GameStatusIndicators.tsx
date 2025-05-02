export default function GameStatusIndicators() {
  return (
    <div className="flex gap-2 items-center">
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200 mr-1"></div>
        <span className="text-xs text-white">Scheduled</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200 animate-pulse mr-1"></div>
        <span className="text-xs text-white">Live</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200 mr-1"></div>
        <span className="text-xs text-white">Final</span>
      </div>
    </div>
  );
}
