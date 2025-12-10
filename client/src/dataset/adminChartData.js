export const dataset = [
    { seoul: 21, month: 'Jan' },
    { seoul: 28, month: 'Feb' },
    { seoul: 28, month: 'Mar' },
    { seoul: 28, month: 'Apr' },
    { seoul: 28, month: 'May' },
    { seoul: 28, month: 'Jun' },
    { seoul: 28, month: 'Jul' },
    { seoul: 28, month: 'Aug' },
    { seoul: 28, month: 'Sep' },
    { seoul: 55, month: 'Oct' },
    { seoul: 48, month: 'Nov' },
    { seoul: 25, month: 'Dec' },
  ];
  
// Build a tiny dataset for the bar chart from the two totals
export function makeEngagementDataset(studentsTotal = 0, instructorsTotal = 0) {
    return [
      { group: "Students", total: Number(studentsTotal) || 0 },
      { group: "Instructors", total: Number(instructorsTotal) || 0 },
    ];
  }

// Build dataset for online users chart
export function makeOnlineUsersDataset(onlineUsers = 0, totalUsers = 0) {
  return [
    { group: "Online", total: Number(onlineUsers) || 0 },
    { group: "Total", total: Number(totalUsers) || 0 },
  ];
}

// Build dataset for admin dashboard with teacher/student splits (showing actual counts)
export function makeAdminMetricsDataset({
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
}) {
  // Combine suspended, reports, and feedbacks
  const totalSuspended = (Number(suspendedStudents) || 0) + (Number(suspendedTeachers) || 0);
  const totalReports = (Number(reportsStudents) || 0) + (Number(reportsTeachers) || 0);
  const totalFeedbacks = (Number(feedbacksStudents) || 0) + (Number(feedbacksTeachers) || 0);

  // Return actual counts (will be displayed on 0-100 scale but showing actual values)
  return [
    { metric: "Online - Student", value: Number(onlineStudents) || 0 },
    { metric: "Online - Teacher", value: Number(onlineTeachers) || 0 },
    { metric: "Suspended", value: totalSuspended },
    { metric: "Applications", value: Number(applications) || 0 },
    { metric: "Reports", value: totalReports },
    { metric: "Feedbacks", value: totalFeedbacks },
  ];
}
  
  // Nice, locale-aware numbers (no units)
  export function valueFormatter(value) {
    if (value == null || Number.isNaN(value)) return "0";
    return Intl.NumberFormat().format(value);
  }
  
  // Count formatter for admin metrics (shows actual count value)
  export function countFormatter(value, context) {
    if (value == null || Number.isNaN(value)) return "0";
    return Intl.NumberFormat().format(value);
  }

