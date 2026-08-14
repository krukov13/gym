import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import WorkoutPage from './pages/WorkoutPage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';
import BodyWeightPage from './pages/BodyWeightPage.jsx';
import MeasurementsPage from './pages/MeasurementsPage.jsx';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function todayWeekday() {
  const idx = new Date().getDay(); // 0 = Sunday
  return WEEKDAYS[(idx + 6) % 7];
}

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>🏋️ Gym Tracker</h1>
      </header>

      <nav className="nav-tabs">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Workout
        </NavLink>
        <NavLink to="/progress" className={({ isActive }) => (isActive ? 'active' : '')}>
          Progress
        </NavLink>
        <NavLink to="/bodyweight" className={({ isActive }) => (isActive ? 'active' : '')}>
          Body Weight
        </NavLink>
        <NavLink to="/measurements" className={({ isActive }) => (isActive ? 'active' : '')}>
          Measurements
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to={`/day/${todayWeekday()}`} replace />} />
        <Route path="/day/:weekday" element={<WorkoutPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/bodyweight" element={<BodyWeightPage />} />
        <Route path="/measurements" element={<MeasurementsPage />} />
      </Routes>
    </div>
  );
}

export { WEEKDAYS, todayWeekday };
