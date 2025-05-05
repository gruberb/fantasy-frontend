import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import FantasyTeamsPage from "./pages/FantasyTeamsPage";
import FantasyTeamDetailPage from "./pages/FantasyTeamDetailPage";
import SkatersPage from "./pages/SkatersPage";
import GamesPage from "./pages/GamesPage";
import RankingsPage from "./pages/RankingsPage";
import MatchDayPage from "./pages/MatchDayPage";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/fantasy-teams" element={<FantasyTeamsPage />} />
        <Route
          path="/fantasy-teams/:teamId"
          element={<FantasyTeamDetailPage />}
        />
        <Route path="/skaters" element={<SkatersPage />} />
        <Route path="/games/:date" element={<GamesPage />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="/match-day" element={<MatchDayPage />} />{" "}
        {/* Add this route */}
        <Route path="/match-day/:date" element={<MatchDayPage />} />{" "}
        {/* Add this route with date parameter */}
      </Routes>
    </Layout>
  );
}

export default App;
