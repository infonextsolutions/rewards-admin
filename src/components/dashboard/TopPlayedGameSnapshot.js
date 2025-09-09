'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const TopPlayedGameSnapshot = ({ data, loading }) => {
  // Mock data for demonstration
  const mockGameData = {
    name: 'Candy Crush Saga',
    banner: '🍭',
    avgXP: 1247,
    rewardConversion: 23.7,
    demographics: {
      age: [
        { name: '13-17', value: 15, color: '#ff6b6b' },
        { name: '18-24', value: 35, color: '#4ecdc4' },
        { name: '25-34', value: 30, color: '#45b7d1' },
        { name: '35-44', value: 15, color: '#f9ca24' },
        { name: '45+', value: 5, color: '#6c5ce7' }
      ],
      gender: [
        { name: 'Female', value: 65, color: '#ff6b9d' },
        { name: 'Male', value: 32, color: '#4ecdc4' },
        { name: 'Other', value: 3, color: '#a0a0a0' }
      ],
      region: [
        { name: 'North America', value: 40, color: '#3742fa' },
        { name: 'Europe', value: 25, color: '#2ed573' },
        { name: 'Asia', value: 20, color: '#ffa502' },
        { name: 'Other', value: 15, color: '#6c5ce7' }
      ],
      tier: [
        { name: 'Gold', value: 25, color: '#ffd700' },
        { name: 'Silver', value: 35, color: '#c0c0c0' },
        { name: 'Bronze', value: 40, color: '#cd7f32' }
      ]
    }
  };

  const DonutChart = ({ data, title, centerText }) => {
    const RADIAN = Math.PI / 180;
    
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return percent > 0.05 ? (
        <text 
          x={x} 
          y={y} 
          fill="white" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={10}
          fontWeight="bold"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      ) : null;
    };

    return (
      <div className="text-center">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
        <div className="relative h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={50}
                innerRadius={25}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Percentage']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {centerText && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs font-semibold text-gray-600">{centerText}</span>
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="mt-2 flex flex-wrap justify-center gap-1">
          {data.map((item, index) => (
            <div key={index} className="flex items-center text-xs">
              <div 
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-gray-600 truncate max-w-16">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="h-32 bg-gray-100 rounded"></div>
              <div className="h-32 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Played Game</h2>
      
      {/* Game Header */}
      <div className="flex items-center mb-6">
        <div className="text-4xl mr-4">{mockGameData.banner}</div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{mockGameData.name}</h3>
          <div className="flex items-center mt-1 space-x-4">
            <div className="text-sm">
              <span className="text-gray-600">Avg. XP:</span>
              <span className="ml-1 font-semibold text-blue-600">
                {mockGameData.avgXP.toLocaleString()}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Conversion:</span>
              <span className="ml-1 font-semibold text-green-600">
                {mockGameData.rewardConversion}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Demographics Charts */}
      <div className="grid grid-cols-2 gap-6">
        <DonutChart 
          data={mockGameData.demographics.age}
          title="Age Distribution"
        />
        
        <DonutChart 
          data={mockGameData.demographics.gender}
          title="Gender Split"
        />
        
        <DonutChart 
          data={mockGameData.demographics.region}
          title="Region Breakdown"
        />
        
        <DonutChart 
          data={mockGameData.demographics.tier}
          title="User Tiers"
        />
      </div>

    </div>
  );
};

export default TopPlayedGameSnapshot;