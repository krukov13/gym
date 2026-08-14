const BASE = '/api';

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getDays: () => request('/days'),
  getDay: (weekday) => request(`/days/${weekday}`),
  getExercises: () => request('/exercises'),
  getExerciseLogs: (id) => request(`/exercises/${id}/logs`),
  getExerciseLogsForDate: (id, date) => request(`/exercises/${id}/logs/${date}`),
  createLog: (log) => request('/logs', { method: 'POST', body: JSON.stringify(log) }),
  updateLog: (id, log) => request(`/logs/${id}`, { method: 'PUT', body: JSON.stringify(log) }),
  deleteLog: (id) => request(`/logs/${id}`, { method: 'DELETE' }),
  getBodyWeight: () => request('/bodyweight'),
  addBodyWeight: (entry) => request('/bodyweight', { method: 'POST', body: JSON.stringify(entry) }),
  deleteBodyWeight: (id) => request(`/bodyweight/${id}`, { method: 'DELETE' }),
  getMeasurementFields: () => request('/measurement-fields'),
  getMeasurements: () => request('/measurements'),
  addMeasurement: (entry) => request('/measurements', { method: 'POST', body: JSON.stringify(entry) }),
  deleteMeasurement: (id) => request(`/measurements/${id}`, { method: 'DELETE' }),
};
