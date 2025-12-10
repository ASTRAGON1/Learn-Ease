import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { makeInstructorDailyDataset, valueFormatter } from "../dataset/instructorDailyData";

export default function InstructorDailyChart({
  dailyStats = [],
  tickPlacement = "middle",
  tickLabelPlacement = "middle",
}) {
  // Get the daily dataset
  const dataset = makeInstructorDailyDataset(dailyStats);

  // Light grey color for all bars (matching admin style)
  const lightGrey = "#cbd5e1";

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', width: '100%' }}>
      <BarChart
        dataset={dataset}
        xAxis={[
          {
            dataKey: "day",
            scaleType: "band",
            tickPlacement,
            tickLabelPlacement,
          },
        ]}
        yAxis={[
          {
            label: "Count",
          },
        ]}
        series={[
          {
            dataKey: "views",
            label: "Views",
            valueFormatter,
            color: lightGrey,
          },
          {
            dataKey: "likes",
            label: "Likes",
            valueFormatter,
            color: "#94a3b8", // Slightly darker grey for differentiation
          },
        ]}
        height={300}
        margin={{ left: 60, right: 16, top: 12, bottom: 28 }}
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

