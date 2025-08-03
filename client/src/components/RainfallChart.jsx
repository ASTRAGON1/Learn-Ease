import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { dataset, valueFormatter } from '../dataset/weather';

const chartSetting = {
  yAxis: [{ label: 'Engagement', width: 60 }],
  series: [
    {
      dataKey: 'seoul',
      label: 'Seoul rainfall',
      valueFormatter,
      color: '#9C6FE4',  // <-- bars will be purple
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
    />
  );
}
