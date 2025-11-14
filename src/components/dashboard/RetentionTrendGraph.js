'use client';

import { memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RetentionTrendGraph = memo(({ data, retentionCurrent, filters, loading }) => {
  // Map API trend data to chart format - memoized for performance
  const chartData = useMemo(() => {
    return data && data.length > 0 ? data.map((item, index) => {
      const d1 = parseFloat(item.d1) || 0;
      const d7 = parseFloat(item.d7) || 0;
      const d14 = parseFloat(item.d14) || 0;
      const d30 = parseFloat(item.d30) || 0;
      
      return {
        day: `Day ${index + 1}`,
        date: item.date,
        retention: d1, // Use D1 retention for main line
        installs: item.cohortSize || 0,
        d1,
        d7,
        d14,
        d30,
      };
    }) : [];
  }, [data]);

  const displayData = chartData;
  const hasData = displayData.length > 0;

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{`Day: ${label}`}</p>
          {payload.map((entry) => (
            <div key={entry.dataKey} className="flex items-center mt-2">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm">
                {entry.dataKey === 'retention' ? 'Retention: ' : 'Users: '}
                <span className="font-semibold">
                  {entry.dataKey === 'retention' 
                    ? `${entry.value}%` 
                    : new Intl.NumberFormat().format(entry.value)
                  }
                </span>
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-80 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Retention Trend Analysis</h2>
          <p className="text-sm text-gray-600 mt-1">
            User retention patterns over time ({filters.dateRange})
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Retention %</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Active Users</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                domain={[0, 100]}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <Tooltip content={customTooltip} />
              
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="retention"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
              />
              
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="installs"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-gray-500 text-sm">No retention data available</p>
              <p className="text-gray-400 text-xs mt-1">Data will appear once available</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {retentionCurrent?.d1?.toFixed(1) || "0.0"}%
            </p>
            <p className="text-sm text-gray-600">D1 Retention</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {retentionCurrent?.d7?.toFixed(1) || "0.0"}%
            </p>
            <p className="text-sm text-gray-600">D7 Retention</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {retentionCurrent?.d14?.toFixed(1) || "0.0"}%
            </p>
            <p className="text-sm text-gray-600">D14 Retention</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {retentionCurrent?.d30?.toFixed(1) || "0.0"}%
            </p>
            <p className="text-sm text-gray-600">D30 Retention</p>
          </div>
        </div>
      </div>
    </div>
  );
});

RetentionTrendGraph.displayName = 'RetentionTrendGraph';

export default RetentionTrendGraph;