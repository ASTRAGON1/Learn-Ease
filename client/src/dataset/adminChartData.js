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

// Build dataset for admin dashboard with teacher/student splits
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
  return [
    { metric: "Online - Student", value: Number(onlineStudents) || 0 },
    { metric: "Online - Teacher", value: Number(onlineTeachers) || 0 },
    { metric: "Offline - Student", value: Number(offlineStudents) || 0 },
    { metric: "Offline - Teacher", value: Number(offlineTeachers) || 0 },
    { metric: "Suspended - Student", value: Number(suspendedStudents) || 0 },
    { metric: "Suspended - Teacher", value: Number(suspendedTeachers) || 0 },
    { metric: "Applications", value: Number(applications) || 0 },
    { metric: "Reports - Student", value: Number(reportsStudents) || 0 },
    { metric: "Reports - Teacher", value: Number(reportsTeachers) || 0 },
    { metric: "Feedbacks - Student", value: Number(feedbacksStudents) || 0 },
    { metric: "Feedbacks - Teacher", value: Number(feedbacksTeachers) || 0 },
  ];
}
  
  // Nice, locale-aware numbers (no units)
  export function valueFormatter(value) {
    if (value == null || Number.isNaN(value)) return "0";
    return Intl.NumberFormat().format(value);
  }

