import { useEffect, useState } from 'react';
import { api } from '../api.js';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function monthKey(date) {
  return date.slice(0, 7); // YYYY-MM
}

export default function SessionStats() {
  const [sessions, setSessions] = useState(null);

  useEffect(() => {
    api.getSessions().then(setSessions);
  }, []);

  if (!sessions) return null;
  if (sessions.length === 0) return null;

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const thisMonthCount = sessions.filter((d) => monthKey(d) === thisMonth).length;
  const lastMonthCount = sessions.filter((d) => monthKey(d) === lastMonth).length;

  return (
    <div className="card">
      <div className="stat-row">
        <div className="stat-tile">
          <div className="value">{thisMonthCount}</div>
          <div className="label">Sessions in {MONTH_NAMES[now.getMonth()]}</div>
        </div>
        <div className="stat-tile">
          <div className="value">{lastMonthCount}</div>
          <div className="label">Sessions in {MONTH_NAMES[lastMonthDate.getMonth()]}</div>
        </div>
        <div className="stat-tile">
          <div className="value">{sessions.length}</div>
          <div className="label">All-time sessions</div>
        </div>
      </div>
    </div>
  );
}
