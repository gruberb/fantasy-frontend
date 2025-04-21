// App configuration

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  TIMEOUT: 10000, // 10 seconds
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === "true",
};

// App settings
export const APP_CONFIG = {
  APP_NAME: "Fantasy NHL Dashboard",
  DEFAULT_SEASON: "20242025",
  DEFAULT_GAME_TYPE: 3, // 3 = Regular season
  STALE_TIME: 1000 * 60 * 5, // 5 minutes
  CACHE_TIME: 1000 * 60 * 30, // 30 minutes
};

// Team colors
export const TEAM_COLORS: Record<
  string,
  { primary: string; secondary: string }
> = {
  // Example team colors - replace with actual NHL team colors
  "Boston Bruins": { primary: "#FFB81C", secondary: "#000000" },
  "Toronto Maple Leafs": { primary: "#00205B", secondary: "#FFFFFF" },
  "Montreal Canadiens": { primary: "#AF1E2D", secondary: "#192168" },
  "New York Rangers": { primary: "#0038A8", secondary: "#CE1126" },
  "Chicago Blackhawks": { primary: "#CF0A2C", secondary: "#000000" },
  "Edmonton Oilers": { primary: "#FF4C00", secondary: "#041E42" },
  "Vancouver Canucks": { primary: "#00843D", secondary: "#041C2C" },
  "Pittsburgh Penguins": { primary: "#FFB81C", secondary: "#000000" },
  "Tampa Bay Lightning": { primary: "#002868", secondary: "#FFFFFF" },
  "Colorado Avalanche": { primary: "#6F263D", secondary: "#236192" },
  // Add more teams as needed
};

// Game status configurations
export const GAME_STATUS = {
  SCHEDULED: "SCHEDULED",
  LIVE: "LIVE",
  FINAL: "FINAL",
  POSTPONED: "POSTPONED",
  CANCELLED: "CANCELLED",
};

// Chart color scheme
export const CHART_COLORS = {
  WINS: "#4CAF50",
  LOSSES: "#F44336",
  OT_LOSSES: "#FFC107",
  PRIMARY: "#041E42",
  SECONDARY: "#AF1E2D",
  TERTIARY: "#FFB81C",
};

// Default query options for React Query
export const DEFAULT_QUERY_OPTIONS = {
  staleTime: APP_CONFIG.STALE_TIME,
  cacheTime: APP_CONFIG.CACHE_TIME,
  retry: 1,
  refetchOnWindowFocus: false,
};

// Export default API URL
export const API_URL = API_CONFIG.BASE_URL;
