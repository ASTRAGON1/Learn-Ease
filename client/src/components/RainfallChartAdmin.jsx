import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { makeEngagementDataset, valueFormatter } from "../dataset/weatherAdmin"; // same path, new exports

const chartSetting = {
  yAxis: [{ label: "Engagement", width: 60 }],
  series: [
    {
      dataKey: "total",
      label: "Total engagement",
      valueFormatter,
      color: "#9C6FE4", // purple bars
    },
  ],
  height: 300,
  margin: { left: 60, right: 16, top: 12, bottom: 28 },
};

export default function RainfallChart({
  studentsTotal = 0,
  instructorsTotal = 0,
  tickPlacement = "middle",
  tickLabelPlacement = "middle",
}) {
  const dataset = makeEngagementDataset(studentsTotal, instructorsTotal);

  return (
    <BarChart
      dataset={dataset}
      xAxis={[
        {
          dataKey: "group",
          scaleType: "band",
          tickPlacement,
          tickLabelPlacement,
        },
      ]}
      {...chartSetting}
    />
  );
}
