import React from 'react';
import {
  LineChart,
  BarChart,
  PieChart,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type ChartType = 'line' | 'bar' | 'pie';

interface ChartProps {
  type: ChartType;
  title: string;
  data: Record<string, any>[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const Chart: React.FC<ChartProps> = ({ type, title, data }) => {
  const ChartComponent = type === 'line' ? LineChart : type === 'bar' ? BarChart : PieChart;
  const DataComponent = type === 'line' ? Line : type === 'bar' ? Bar : Pie;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <DataComponent dataKey="value" fill="#8884d8" />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};
