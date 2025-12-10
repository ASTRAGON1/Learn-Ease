import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { makeEngagementDataset, makeOnlineUsersDataset, makeAdminMetricsDataset, valueFormatter } from "../dataset/adminChartData";

export default function RainfallChart({
  studentsTotal = 0,
  instructorsTotal = 0,
  onlineUsers = 0,
  totalUsers = 0,
  // New props for admin metrics with teacher/student splits
  onlineStudents = 0,
  onlineTeachers = 0,
  offlineStudents = 0,
  offlineTeachers = 0,
  suspendedStudents = 0,
  suspendedTeachers = 0,
  applications = 0,
  reportsStudents = 0,
  reportsTeachers = 0,
  feedbacksStudents = 0,
  feedbacksTeachers = 0,
  tickPlacement = "middle",
  tickLabelPlacement = "middle",
}) {
  // If admin metrics are provided, use them
  const useAdminMetrics = onlineStudents !== undefined || onlineTeachers !== undefined || 
                          offlineStudents !== undefined || offlineTeachers !== undefined ||
                          suspendedStudents !== undefined || suspendedTeachers !== undefined ||
                          applications !== undefined || reportsStudents !== undefined || 
                          reportsTeachers !== undefined || feedbacksStudents !== undefined || 
                          feedbacksTeachers !== undefined;

  let dataset;
  let chartSetting;

  if (useAdminMetrics) {
    dataset = makeAdminMetricsDataset({
      onlineStudents: onlineStudents || 0,
      onlineTeachers: onlineTeachers || 0,
      offlineStudents: offlineStudents || 0,
      offlineTeachers: offlineTeachers || 0,
      suspendedStudents: suspendedStudents || 0,
      suspendedTeachers: suspendedTeachers || 0,
      applications: applications || 0,
      reportsStudents: reportsStudents || 0,
      reportsTeachers: reportsTeachers || 0,
      feedbacksStudents: feedbacksStudents || 0,
      feedbacksTeachers: feedbacksTeachers || 0,
    });

    // All colors are light grey
    const lightGrey = "#cbd5e1";
    const colors = Array(6).fill(lightGrey); // Updated to 6 bars: Online Student, Online Teacher, Suspended, Applications, Reports, Feedbacks

    chartSetting = {
      yAxis: [{ label: "Count", width: 60 }],
      series: [
        {
          dataKey: "value",
          label: "Count",
          valueFormatter,
        },
      ],
      colors: colors,
      height: 300,
      margin: { left: 60, right: 16, top: 12, bottom: 28 },
    };
  } else {
    // Use online users if provided, otherwise fall back to engagement
    dataset = onlineUsers !== undefined && totalUsers !== undefined
      ? makeOnlineUsersDataset(onlineUsers, totalUsers)
      : makeEngagementDataset(studentsTotal, instructorsTotal);

    chartSetting = {
      yAxis: [{ label: "Users", width: 60 }],
      series: [
        {
          dataKey: "total",
          label: "Online Users",
          valueFormatter,
          color: "#5a5a65", // lighter bars
        },
      ],
      height: 300,
      margin: { left: 60, right: 16, top: 12, bottom: 28 },
    };
  }

  const xAxisKey = useAdminMetrics ? "metric" : "group";

  return (
    <BarChart
      dataset={dataset}
      xAxis={[
        {
          dataKey: xAxisKey,
          scaleType: "band",
          tickPlacement,
          tickLabelPlacement,
        },
      ]}
      {...chartSetting}
    />
  );
}
