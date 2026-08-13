import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}`;
}

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '8px 10px',
        fontSize: '0.82rem',
        color: 'var(--text-primary)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>
        {payload[0].value} {unit}
      </div>
    </div>
  );
}

export default function TrendChart({ data, unit }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No data logged yet.</div>;
  }

  const chartData = data.map((d) => ({ ...d, label: formatDate(d.date) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
        <CartesianGrid stroke="var(--gridline)" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="var(--muted)"
          tick={{ fill: 'var(--muted)', fontSize: 12 }}
          axisLine={{ stroke: 'var(--baseline)' }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          stroke="var(--muted)"
          tick={{ fill: 'var(--muted)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={44}
          domain={[(min) => Math.floor(min - Math.max(1, (min * 0.02))), (max) => Math.ceil(max + Math.max(1, (max * 0.02)))]}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ stroke: 'var(--baseline)' }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--series-1)"
          strokeWidth={2}
          strokeLinecap="round"
          dot={{ r: 3, fill: 'var(--series-1)', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
