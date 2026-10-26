import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface GrowthChartProps {
  highlightComplexity?: string;
  comparedAlgorithms?: { id: string; name: string; complexity: string; color: string }[];
  height?: number;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({
  highlightComplexity,
  comparedAlgorithms,
  height = 320,
}) => {
  const [useLogScale, setUseLogScale] = useState<boolean>(false);
  const [maxN, setMaxN] = useState<number>(50);

  // Generate data points for N from 1 to maxN
  const chartData = useMemo(() => {
    const data = [];
    const step = Math.max(1, Math.floor(maxN / 25));

    for (let n = 1; n <= maxN; n += step) {
      const logVal = Math.max(1, Math.log2(n));
      const nLogN = n * logVal;
      const n2 = n * n;
      const n3 = n * n * n;
      const twoPowerN = n <= 20 ? Math.pow(2, n) : Math.pow(2, 20);

      data.push({
        n,
        'O(1)': 1,
        'O(log n)': Number(logVal.toFixed(2)),
        'O(n)': n,
        'O(n log n)': Number(nLogN.toFixed(1)),
        'O(n^2)': n2,
        'O(n^3)': n3,
        'O(2^n)': Math.min(twoPowerN, 1000000),
      });
    }
    return data;
  }, [maxN]);

  // Color mapping for theoretical curves
  const curveColors: Record<string, string> = {
    'O(1)': '#10b981',       // Emerald
    'O(log n)': '#06b6d4',   // Cyan
    'O(n)': '#3b82f6',       // Blue
    'O(n log n)': '#8b5cf6', // Violet
    'O(n^2)': '#f59e0b',     // Amber
    'O(n^3)': '#f97316',     // Orange
    'O(2^n)': '#ef4444',     // Red
  };

  const isMultiCompare = comparedAlgorithms && comparedAlgorithms.length > 0;

  return (
    <div className="bg-dark-850 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-200">
              Theoretical Asymptotic Growth Curve
            </h4>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-violet/10 text-brand-violet border border-brand-violet/20">
              Theoretical Operations vs N
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Mathematical asymptotic operations computed across problem size input \(N\). Not measured hardware clock execution.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center bg-dark-900 border border-slate-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setUseLogScale(false)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                !useLogScale
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Linear Scale
            </button>
            <button
              type="button"
              onClick={() => setUseLogScale(true)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                useLogScale
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Log Scale
            </button>
          </div>

          <select
            value={maxN}
            onChange={(e) => setMaxN(Number(e.target.value))}
            className="bg-dark-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value={20}>N = 1 to 20</option>
            <option value={50}>N = 1 to 50</option>
            <option value={100}>N = 1 to 100</option>
          </select>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="n"
              stroke="#64748b"
              fontSize={11}
              tickLine={{ stroke: '#334155' }}
              label={{ value: 'Problem Size (n)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              scale={useLogScale ? 'log' : 'auto'}
              domain={useLogScale ? [1, 'auto'] : [0, 'auto']}
              allowDataOverflow={true}
              tickLine={{ stroke: '#334155' }}
              label={{
                value: useLogScale ? 'Operations (Log)' : 'Operations f(n)',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#f8fafc',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
              }}
              formatter={(val: any, name: string) => [
                typeof val === 'number' ? Math.round(val).toLocaleString() : val,
                name,
              ]}
              labelFormatter={(label) => `Input Size N = ${label}`}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => <span className="text-slate-300 font-mono text-[11px]">{value}</span>}
            />

            {isMultiCompare ? (
              // Multi-algorithm comparison mode
              comparedAlgorithms.map((algo) => {
                const safeKey = Object.keys(curveColors).includes(algo.complexity)
                  ? algo.complexity
                  : 'O(n)';
                return (
                  <Line
                    key={algo.id}
                    type="monotone"
                    dataKey={safeKey}
                    name={`${algo.name} (${algo.complexity})`}
                    stroke={algo.color}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: algo.color }}
                    activeDot={{ r: 6 }}
                  />
                );
              })
            ) : (
              // Standard single or reference view
              Object.entries(curveColors).map(([cls, color]) => {
                const isTarget = highlightComplexity === cls;
                const strokeWidth = isTarget ? 3.5 : 1.5;
                const strokeOpacity = highlightComplexity ? (isTarget ? 1.0 : 0.25) : 0.75;

                return (
                  <Line
                    key={cls}
                    type="monotone"
                    dataKey={cls}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeOpacity={strokeOpacity}
                    dot={isTarget ? { r: 3, fill: color } : false}
                    activeDot={{ r: 5 }}
                  />
                );
              })
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
