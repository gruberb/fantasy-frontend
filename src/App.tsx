import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import TeamsPage from "./pages/TeamsPage";
import TeamDetailPage from "./pages/TeamDetailPage";
import PlayersPage from "./pages/PlayersPage";
import GamesPage from "./pages/GamesPage";
import RankingsPage from "./pages/RankingsPage";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/teams/:teamId" element={<TeamDetailPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/games/:date" element={<GamesPage />} />
        <Route path="/rankings" element={<RankingsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
