// Placeholder data for the Home screen's user/stats section. Swap for real
// account + analytics data once those endpoints exist.
export const DUMMY_USER = {
  name: "Jordan Blake",
  role: "Training Coordinator",
  team: "EO Investigations Unit",
};

export const DUMMY_STATS = [
  { label: "Scenarios Created", value: "24" },
  { label: "Chats Completed", value: "138" },
  { label: "Avg. Session Length", value: "6m 42s" },
  { label: "Sessions This Week", value: "9" },
];

const RELATIVE_TIMES = ["2 hours ago", "Yesterday", "2 days ago", "4 days ago", "1 week ago", "2 weeks ago", "3 weeks ago"];

export function dummyLastRun(index) {
  return RELATIVE_TIMES[index % RELATIVE_TIMES.length];
}
