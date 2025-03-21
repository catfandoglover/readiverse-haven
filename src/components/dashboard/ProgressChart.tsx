
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface ProgressData {
  name: string;
  value: number;
  color: string;
}

interface ProgressChartProps {
  data: ProgressData[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            formatter={(value, entry, index) => <span className="text-[#E9E7E2] text-sm font-oxanium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
