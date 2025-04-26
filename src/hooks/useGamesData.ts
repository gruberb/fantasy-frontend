import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import {
  toLocalDateString,
  dateStringToLocalDate,
  isSameLocalDay,
} from "../utils/timezone";

export function useGamesData(dateParam?: string) {
  const navigate = useNavigate();

  // Helper to validate date format
  const isValidDate = (dateString: string): boolean => {
    // Check if the date string matches format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;

    // Check if it's a valid date
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  // State for date selector - initialized from URL parameter if valid
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // If there's a valid date in the URL, use it
    if (dateParam && isValidDate(dateParam)) {
      return dateParam;
    }
    // Otherwise, use today
    return toLocalDateString(new Date());
  });

  // State for tabs, filters, and game expansions
  const [activeTab, setActiveTab] = useState("games");
  const [filterTeam] = useState<string>("all");
  const [expandedGames, setExpandedGames] = useState<Set<number>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  // Update URL when date changes
  const updateSelectedDate = (newDate: string) => {
    setSelectedDate(newDate);
    // Update URL without full reload
    navigate(`/games/${newDate}`, { replace: true });
  };

  // Toggle game expansion state
  const toggleGameExpansion = (gameId: number) => {
    setExpandedGames((prevExpandedGames) => {
      const newExpandedGames = new Set(prevExpandedGames);
      if (newExpandedGames.has(gameId)) {
        newExpandedGames.delete(gameId);
      } else {
        newExpandedGames.add(gameId);
      }
      return newExpandedGames;
    });
  };

  // Fetch data for the selected date
  const {
    data: gamesData,
    isLoading: gamesLoading,
    error: gamesError,
    refetch: refetchGames,
  } = useQuery({
    queryKey: ["games", selectedDate],
    queryFn: () => {
      if (isSameLocalDay(dateStringToLocalDate(selectedDate), new Date())) {
        return api.getTodaysGames();
      }
      return api.getGames(selectedDate);
    },
    retry: 1,
  });

  // Check if there are live games on the selected date
  const hasLiveGames =
    (gamesData?.games &&
      gamesData.games.length > 0 &&
      gamesData.games.some(
        (game) => (game.gameState || "").toUpperCase() === "LIVE",
      )) ||
    false;

  // Auto-refresh for live games - Updated Logic
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (autoRefresh && hasLiveGames) {
      intervalId = setInterval(() => {
        // Always refetch if there are live games, regardless of selected date
        refetchGames();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, hasLiveGames, refetchGames]);

  // Reset autoRefresh when date changes to prevent stale auto-refresh
  useEffect(() => {
    // When the selected date changes, check if we should keep autoRefresh on
    // If there are no live games on the new date, turn off autoRefresh
    if (autoRefresh && !hasLiveGames) {
      setAutoRefresh(false);
    }
  }, [selectedDate, hasLiveGames, autoRefresh]);

  // Function to get team primary color
  const getTeamPrimaryColor = (teamName: string): string => {
    const teamColors: Record<string, string> = {
      ANA: "#F47A38", // Anaheim Ducks
      ARI: "#8C2633", // Arizona Coyotes
      BOS: "#FFB81C", // Boston Bruins
      BUF: "#002654", // Buffalo Sabres
      CGY: "#C8102E", // Calgary Flames
      CAR: "#CC0000", // Carolina Hurricanes
      CHI: "#CF0A2C", // Chicago Blackhawks
      COL: "#6F263D", // Colorado Avalanche
      CBJ: "#002654", // Columbus Blue Jackets
      DAL: "#006847", // Dallas Stars
      DET: "#CE1126", // Detroit Red Wings
      EDM: "#FF4C00", // Edmonton Oilers
      FLA: "#C8102E", // Florida Panthers
      LAK: "#111111", // Los Angeles Kings
      MIN: "#154734", // Minnesota Wild
      MTL: "#AF1E2D", // Montreal Canadiens
      NSH: "#FFB81C", // Nashville Predators
      NJD: "#CE1126", // New Jersey Devils
      NYI: "#00539B", // New York Islanders
      NYR: "#0038A8", // New York Rangers
      OTT: "#C52032", // Ottawa Senators
      PHI: "#F74902", // Philadelphia Flyers
      PIT: "#FFB81C", // Pittsburgh Penguins
      SJS: "#006D75", // San Jose Sharks
      SEA: "#99D9D9", // Seattle Kraken
      STL: "#002F87", // St. Louis Blues
      TBL: "#002868", // Tampa Bay Lightning
      TOR: "#00205B", // Toronto Maple Leafs
      VAN: "#00205B", // Vancouver Canucks
      VGK: "#B4975A", // Vegas Golden Knights
      WSH: "#C8102E", // Washington Capitals
      WPG: "#041E42", // Winnipeg Jets
    };

    // Try to find the team by looking for partial matches
    for (const [key, color] of Object.entries(teamColors)) {
      if (teamName.includes(key)) {
        return color;
      }
    }

    // Default color if team not found
    return "#041E42"; // NHL blue
  };

  // Check if selected date is today
  const isTodaySelected = isSameLocalDay(
    dateStringToLocalDate(selectedDate),
    new Date(),
  );

  // Filter games based on selected team
  const filteredGames = gamesData?.games
    ? filterTeam === "all"
      ? gamesData.games
      : gamesData.games.filter(
          (game) =>
            game.homeTeam === filterTeam || game.awayTeam === filterTeam,
        )
    : [];

  return {
    selectedDate,
    updateSelectedDate,
    activeTab,
    setActiveTab,
    gamesData,
    filteredGames,
    gamesLoading,
    gamesError,
    refetchGames,
    expandedGames,
    toggleGameExpansion,
    autoRefresh,
    setAutoRefresh,
    hasLiveGames,
    isTodaySelected,
    getTeamPrimaryColor,
  };
}
