// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ListenAndBuild from './pages/ListenAndBuild'
import EnglishGame from './pages/EnglishGame'
import CalculateGame from './pages/CalculateGame'
import AdminWords from './pages/AdminWords'
import Leaderboard from './pages/Leaderboard'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/spelling" element={<ListenAndBuild />} />
          <Route path="/english" element={<EnglishGame />} />
        <Route path="/math" element={<CalculateGame />} />
        <Route path="/admin" element={<AdminWords />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  )
}
