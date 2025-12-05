import Home from './pages/Home';
import Dashboard from './pages/Dashboards'; git
import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
      </Routes>
    </div>
  );
}