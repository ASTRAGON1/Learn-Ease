import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { dataset, valueFormatter } from '../dataset/weather';

export default function RainfallChart({
  tickPlacement = 'middle',
  tickLabelPlacement = 'middle',
  width = 800,
}) {
  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', width: '100%' }}>
      <BarChart
        dataset={dataset}
        xAxis={[
          { 
            dataKey: 'month', 
            tickPlacement, 
            tickLabelPlacement,
            scaleType: 'band',
          }
        ]}
        yAxis={[
          { 
            label: 'Count',
          }
        ]}
        series={[
          {
            dataKey: 'views',
            label: 'Total Views',
            valueFormatter,
            color: '#6c2ed4',  // purple
          },
          {
            dataKey: 'likes',
            label: 'Likes',
            valueFormatter,
            color: '#64748b',  // gray
          },
        ]}
        height={320}
        width={width}
        margin={{ left: 50, right: 24, top: 24, bottom: 40 }}
        borderRadius={8}
        sx={{
          '& .MuiChartsAxis-label': {
            fontFamily: 'Poppins, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            fill: '#1a1a1a',
          },
          '& .MuiChartsAxis-tickLabel': {
            fontFamily: 'Poppins, sans-serif',
            fontSize: 12,
            fill: '#6b7280',
          },
          '& .MuiChartsLegend-root': {
            fontFamily: 'Poppins, sans-serif',
          },
          '& .MuiChartsLegend-series text': {
            fontFamily: 'Poppins, sans-serif',
            fontSize: 13,
            fill: '#1a1a1a',
          },
        }}
      />
    </div>
  );
}
