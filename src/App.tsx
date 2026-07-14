import { HashRouter, NavLink, Route, Routes } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import PensionSimulatorPage from "./pages/PensionSimulatorPage";
import "./App.css";

function App() {
  return (
    <HashRouter>
      <nav className="top-nav">
        <NavLink to="/" end>
          연금 시뮬레이터
        </NavLink>
        <NavLink to="/profile">내 프로필</NavLink>
        <NavLink to="/chat">HyperCLOVA X 챗</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<PensionSimulatorPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
