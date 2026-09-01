import React from 'react';

const PerformanceTrendChart = ({ labels = [], scores = [], height = 240 }) => {
  if (!labels.length || !scores.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-500 text-sm">
        <p>No assessment trend data available yet.</p>
      </div>
    );
  }

  const width = 600;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const maxVal = 100;
  const minVal = 0;

  // Generate SVG coordinates
  const points = scores.map((score, index) => {
    const x = paddingX + (chartWidth / Math.max(labels.length - 1, 1)) * index;
    const y = height - paddingY - ((score - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, score, label: labels[index] };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto max-h-[300px] overflow-visible"
      >
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((gridVal) => {
          const y = height - paddingY - ((gridVal - minVal) / (maxVal - minVal)) * chartHeight;
          return (
            <g key={gridVal}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#334155"
                strokeDasharray="4 4"
                strokeWidth="0.75"
              />
              <text
                x={paddingX - 8}
                y={y + 3}
                fill="#64748b"
                fontSize="10"
                textAnchor="end"
                fontWeight="500"
              >
                {gridVal}%
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#trendGradient)" />

        {/* Trend line */}
        <path
          d={pathD}
          fill="none"
          stroke="#6366f1"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points & labels */}
        {points.map((pt, idx) => (
          <g key={idx} className="group">
            <circle
              cx={pt.x}
              cy={pt.y}
              r="5"
              fill="#0f172a"
              stroke="#818cf8"
              strokeWidth="2.5"
              className="transition-all duration-200 group-hover:r-7 group-hover:fill-indigo-500"
            />
            {/* Score label on top of point */}
            <text
              x={pt.x}
              y={pt.y - 10}
              fill="#cbd5e1"
              fontSize="11"
              fontWeight="600"
              textAnchor="middle"
            >
              {pt.score}%
            </text>
            {/* X-axis label */}
            <text
              x={pt.x}
              y={height - 10}
              fill="#94a3b8"
              fontSize="10"
              textAnchor="middle"
              className="truncate"
            >
              {pt.label.length > 12 ? `${pt.label.slice(0, 10)}...` : pt.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default PerformanceTrendChart;
