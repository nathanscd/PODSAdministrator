import Home from './pages/Home';
import Dashboard from './pages/Dashboards';
import { Routes, Route } from 'react-router-dom';
import WorkspacePage from './pages/WorkspacePage'
import HomePage from './pages/HomePage'

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="page/:pageId" element={<WorkspacePage />} />
      </Routes>
    </div>
  );
}