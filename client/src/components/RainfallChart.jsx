import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { dataset, valueFormatter } from '../dataset/weather';

const chartSetting = {
  yAxis: [{ label: 'Count', width: 60 }],
  series: [
    {
      dataKey: 'views',
      label: 'Total Views',
      valueFormatter,
      color: '#475569',  // grey color
    },
    {
      dataKey: 'likes',
      label: 'Likes',
      valueFormatter,
      color: '#64748b',  // lighter grey
    },
  ],
  height: 300,
  margin: { left: 0 },
};

export default function RainfallChart({
  tickPlacement = 'middle',
  tickLabelPlacement = 'middle',
}) {
  return (
    <BarChart
      dataset={dataset}
      xAxis={[{ dataKey: 'month', tickPlacement, tickLabelPlacement }]}
      {...chartSetting}
      width={800}
    />
  );
}
