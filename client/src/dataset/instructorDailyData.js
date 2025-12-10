// Daily dataset for instructor views and likes
// Last 7 days of data
export const dailyDataset = [
  { day: 'Mon', views: 45, likes: 12 },
  { day: 'Tue', views: 52, likes: 18 },
  { day: 'Wed', views: 38, likes: 15 },
  { day: 'Thu', views: 61, likes: 22 },
  { day: 'Fri', views: 48, likes: 19 },
  { day: 'Sat', views: 35, likes: 14 },
  { day: 'Sun', views: 42, likes: 16 },
];

// Build dataset for instructor daily metrics
export function makeInstructorDailyDataset(dailyStats = []) {
  // If no data provided, use sample data
  if (!dailyStats || dailyStats.length === 0) {
    return dailyDataset;
  }
  
  // Transform provided daily stats to match chart format
  return dailyStats.map(stat => ({
    day: stat.day || stat.date,
    views: Number(stat.views) || 0,
    likes: Number(stat.likes) || 0,
  }));
}

// Nice, locale-aware numbers (no units)
export function valueFormatter(value) {
  if (value == null || Number.isNaN(value)) return "0";
  return Intl.NumberFormat().format(value);
}

