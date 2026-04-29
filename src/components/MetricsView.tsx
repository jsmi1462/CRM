import React from 'react';
import { Chart } from './Chart';

export const MetricsView: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Metrics & Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Chart type="line" title="Contact Frequency" data={[]} />
        <Chart type="bar" title="Conversion Rates" data={[]} />
        <Chart type="pie" title="Lead Status Distribution" data={[]} />
      </div>
    </div>
  );
};
