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
  
  // Nice, locale-aware numbers (no units)
  export function valueFormatter(value) {
    if (value == null || Number.isNaN(value)) return "0";
    return Intl.NumberFormat().format(value);
  }
  