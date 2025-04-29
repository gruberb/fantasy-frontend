import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import FantasyTeamsPage from "./pages/FantasyTeamsPage";
import FantasyTeamDetailPage from "./pages/FantasyTeamDetailPage";
import SkatersPage from "./pages/SkatersPage";
import GamesPage from "./pages/GamesPage";
import RankingsPage from "./pages/RankingsPage";

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
      </Routes>
    </Layout>
  );
}

export default App;
